import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { verifyMfaTrustToken, normalizeIpAddress } from '@/lib/mfa'

// Which routes require MFA?
const MFA_PROTECTED_PATHS = [
  '/staff/',
  '/admin/',
];

// Verify JWT from HttpOnly cookie and return user id
async function getUserIdFromSession(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  try {
    const secretText = process.env.JWT_SECRET
    if (!secretText) return null
    const secret = new TextEncoder().encode(secretText)
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    const userId = (payload as any)?.userId
    return typeof userId === 'string' ? userId : userId?.toString() ?? null
  } catch {
    return null
  }
}

function requiresMfa(pathname: string): boolean {
  return MFA_PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const url = request.nextUrl.clone()

  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  // Content Security Policy and related security headers
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    // Scripts and styles
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    // Assets
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Network
    "connect-src 'self' https: wss:",
    // Media and frames
    "media-src 'self' https: blob:",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  
  // Cache static assets
  if (request.nextUrl.pathname.startsWith('/_next/static') || 
      request.nextUrl.pathname.startsWith('/images') ||
      request.nextUrl.pathname.startsWith('/vehicles') ||
      request.nextUrl.pathname.endsWith('.png') ||
      request.nextUrl.pathname.endsWith('.jpg') ||
      request.nextUrl.pathname.endsWith('.jpeg') ||
      request.nextUrl.pathname.endsWith('.gif') ||
      request.nextUrl.pathname.endsWith('.svg') ||
      request.nextUrl.pathname.endsWith('.ico') ||
      request.nextUrl.pathname.endsWith('.css') ||
      request.nextUrl.pathname.endsWith('.js')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // HTTPS redirect in production
  if (
    request.nextUrl.protocol === 'http:' &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.redirect(
      `https://${request.nextUrl.host}${request.nextUrl.pathname}`,
      308
    );
  }

  // Skip MFA checking for non-protected routes
  if (!requiresMfa(request.nextUrl.pathname)) {
    return response;
  }

  // Skip MFA checking for login pages
  if (request.nextUrl.pathname === '/staff/login' || request.nextUrl.pathname === '/admin/login') {
    return response;
  }

  // Check if user is signed in
  const userId = await getUserIdFromSession(request);
  
  // If not signed in, redirect to login
  if (!userId) {
    if (request.nextUrl.pathname.startsWith('/staff/')) {
      url.pathname = '/staff/login';
      return NextResponse.redirect(url);
    } else if (request.nextUrl.pathname.startsWith('/admin/')) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Enforce MFA trusted device token for protected routes
  const mfaToken = request.cookies.get('mfa_trust')?.value
  if (mfaToken && userId) {
    const ua = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0]?.trim() || '' : ''
    const normalizedIp = normalizeIpAddress(ip)
    const trusted = await verifyMfaTrustToken(mfaToken, { userId, userAgent: ua, ip: normalizedIp })
    if (trusted) {
      return response
    }
  }

  // If no trusted token, redirect to MFA page
  if (request.nextUrl.pathname.startsWith('/staff/')) {
    url.pathname = '/mfa'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    url.pathname = '/mfa'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 