// lib/mfa.ts
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import crypto from 'node:crypto';

const MFA_TRUST_SECRET = new TextEncoder().encode(process.env.MFA_TRUST_SECRET || 'fallback-secret-for-development-only');
const EIGHT_HOURS = 8 * 60 * 60; // seconds

export function hash(v: string) {
  return crypto.createHash('sha256').update(v).digest('base64url');
}

export async function issueMfaTrustToken(params: {
  userId: string;
  userAgent?: string;
  ip?: string; // consider normalizing to /24 for mobile networks
  jti?: string;
  maxAgeSec?: number;
}) {
  const { userId, userAgent = '', ip = '', jti = crypto.randomUUID(), maxAgeSec = EIGHT_HOURS } = params;

  const payload: JWTPayload = {
    sub: userId,
    jti,
    ua: hash(userAgent),
    ip: ip ? hash(ip) : undefined,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(MFA_TRUST_SECRET);

  return { token, jti, maxAgeSec };
}

export async function verifyMfaTrustToken(token: string, checks: { userId: string; userAgent?: string; ip?: string }) {
  try {
    const { payload } = await jwtVerify(token, MFA_TRUST_SECRET, { algorithms: ['HS256'] });

    if (payload.sub !== checks.userId) return false;
    if (checks.userAgent && payload.ua && payload.ua !== hash(checks.userAgent)) return false;
    if (checks.ip && payload.ip && payload.ip !== hash(checks.ip)) return false;

    // optionally check DB revocation by payload.jti
    return payload; // truthy means trusted
  } catch (error) {
    console.error('MFA trust token verification failed:', error);
    return false;
  }
}

// Helper function to get user ID from session (adapt to your auth system)
export async function getUserIdFromSession(sessionToken: string): Promise<string | null> {
  // This is a placeholder - you'll need to implement based on your session management
  // For now, we'll decode from a simple JWT session token or return a test user
  try {
    // If you're using a different session management system, adapt this accordingly
    // For testing purposes, return a mock user ID
    return 'test-user-id';
  } catch {
    return null;
  }
}

// Helper to normalize IP address (get /24 subnet for mobile networks)
export function normalizeIpAddress(ip: string): string {
  if (!ip) return '';
  
  // For IPv4, get the /24 subnet (first 3 octets)
  const ipv4Match = ip.match(/^(\d+\.\d+\.\d+)\./);
  if (ipv4Match) {
    return ipv4Match[1] + '.0';
  }
  
  // For IPv6, get the /64 subnet (first 4 groups)
  const ipv6Match = ip.match(/^([0-9a-f:]+):/i);
  if (ipv6Match) {
    const groups = ipv6Match[1].split(':').slice(0, 4);
    return groups.join(':') + '::';
  }
  
  return ip; // fallback to original IP
}
