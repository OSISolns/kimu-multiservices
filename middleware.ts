import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Which routes require MFA?
const MFA_PROTECTED_PATHS = [
  '/staff/',
  '/admin/',
];

// Get user ID from session (this is a simplified implementation)
async function getUserIdFromSession(req: NextRequest): Promise<string | null> {
  // Check for user data in localStorage (client-side) via cookie or session
  // This is a simplified approach - in production you'd have proper session management
  const userCookie = req.cookies.get('user_session')?.value;
  
  if (userCookie) {
    try {
      // In a real app, you'd decode and verify a JWT session token here
      // For now, we'll extract from localStorage-like data
      const userData = JSON.parse(decodeURIComponent(userCookie));
      return userData.id?.toString() || null;
    } catch {
      return null;
    }
  }
  
  // Alternative: check for a simpler session indicator
  const isStaffCookie = req.cookies.get('isStaff')?.value;
  const userDataCookie = req.cookies.get('user')?.value;
  
  if (isStaffCookie === 'true' && userDataCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookie));
      return userData.id?.toString() || 'temp-user-id';
    } catch {
      return null;
    }
  }
  
  return null;
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

  // For now, allow access to protected routes if user is signed in
  // MFA verification will be handled at the page level
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