import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Require a reasonably strong secret; avoid weak defaults
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

export interface JWTPayloadData extends JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token for user authentication
 */
export async function createToken(payload: {
  userId: string;
  username: string;
  role: string;
  expiresIn?: string;
}): Promise<string> {
  const { userId, username, role, expiresIn = '24h' } = payload;
  
  const token = await new SignJWT({
    userId,
    username,
    role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());

  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayloadData | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });
    
    return payload as JWTPayloadData;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get user data from JWT token in request headers
 */
export async function getUserFromToken(request: Request): Promise<JWTPayloadData | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return await verifyToken(token);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Get user data from JWT token in cookies
 */
export async function getUserFromCookie(): Promise<JWTPayloadData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    return await verifyToken(token);
  } catch (error) {
    console.error('Error getting user from cookie:', error);
    return null;
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(token: string, maxAge: number = 24 * 60 * 60) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `auth-token=${token}`,
    'HttpOnly',
    isProd ? 'Secure' : '',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    'Path=/',
  ].filter(Boolean);
  return { 'Set-Cookie': parts.join('; ') };
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    'auth-token=',
    'HttpOnly',
    isProd ? 'Secure' : '',
    'SameSite=Strict',
    'Max-Age=0',
    'Path=/',
  ].filter(Boolean);
  return { 'Set-Cookie': parts.join('; ') };
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(user: JWTPayloadData | null, requiredRoles: string[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: JWTPayloadData | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user has staff role or higher
 */
export function isStaff(user: JWTPayloadData | null): boolean {
  if (!user) return false;
  return ['admin', 'manager', 'staff', 'accountant', 'transport-officer'].includes(user.role);
}
