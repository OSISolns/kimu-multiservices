import { NextRequest, NextResponse } from 'next/server';
import { prisma, retryDatabaseOperation } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken, setAuthCookie } from '@/lib/jwt';
import { validateInput, loginSchema, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse, createAuthErrorResponse } from '@/lib/errors';
import { hasAnyRole } from '@/lib/utils';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { LoginRequest, LoginResponse, UserRole } from '@/types/api';

// Simple in-memory rate limiter per IP
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10; // max attempts per window
const loginAttemptsByIp: Map<string, { count: number; windowStart: number }> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttemptsByIp.get(ip);
  if (!record) {
    loginAttemptsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }
  const windowElapsed = now - record.windowStart;
  if (windowElapsed > RATE_LIMIT_WINDOW_MS) {
    // reset window
    loginAttemptsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }
  record.count += 1;
  return record.count > RATE_LIMIT_MAX_ATTEMPTS;
}

// Backoff/lockout policy per IP
const FAILED_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_ATTEMPTS = 5; // lock after 5 failed attempts
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
type FailureRecord = { failedCount: number; windowStart: number; lockedUntil?: number };
const failedLoginsByIp: Map<string, FailureRecord> = new Map();

function isLocked(ip: string): boolean {
  const record = failedLoginsByIp.get(ip);
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return true;
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    failedLoginsByIp.delete(ip);
    return false;
  }
  return false;
}

function recordFailedAttempt(ip: string): FailureRecord {
  const now = Date.now();
  const record = failedLoginsByIp.get(ip);
  if (!record) {
    const created: FailureRecord = { failedCount: 1, windowStart: now };
    failedLoginsByIp.set(ip, created);
    return created;
  }
  const windowElapsed = now - record.windowStart;
  if (windowElapsed > FAILED_WINDOW_MS) {
    record.failedCount = 1;
    record.windowStart = now;
  } else {
    record.failedCount += 1;
    if (record.failedCount >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = now + LOCK_DURATION_MS;
    }
  }
  return record;
}

function resetFailedAttempts(ip: string) {
  failedLoginsByIp.delete(ip);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isLocked(ip)) {
      const retryAfter = Math.ceil((failedLoginsByIp.get(ip)!.lockedUntil! - Date.now()) / 1000);
      const lockedResponse = NextResponse.json({
        success: false,
        error: 'Account temporarily locked due to too many failed attempts. Try again later.',
        timestamp: new Date().toISOString(),
      }, { status: 429 });
      if (retryAfter > 0) lockedResponse.headers.set('Retry-After', String(retryAfter));
      return lockedResponse;
    }
    if (isRateLimited(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Too many login attempts. Please try again later.',
        timestamp: new Date().toISOString(),
      }, { status: 429 });
    }

    const body: LoginRequest = await req.json();
    
    // Validate input
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { username, password } = validation.data!;
    
    // Sanitize input
    const sanitizedUsername = sanitizeString(username);
    const user = await retryDatabaseOperation(async () => {
      return await prisma.user.findUnique({ where: { username: sanitizedUsername } });
    });
    if (!user) {
      recordFailedAttempt(ip);
      return createAuthErrorResponse('Invalid username or password');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedAttempt(ip);
      return createAuthErrorResponse('Invalid username or password');
    }
    // Only allow staff, admin, transport-officer, or accountant
    if (!hasAnyRole({ role: user.role as UserRole }, ['staff', 'admin', 'transport-officer', 'accountant'])) {
      return NextResponse.json({ 
        success: false,
        error: 'Not authorized',
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }
    // Create JWT token
    const token = await createToken({
      userId: user.id.toString(),
      username: user.username,
      role: user.role as UserRole,
    });

    // Update last login time
    await retryDatabaseOperation(async () => {
      return await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
    });

    // Log successful login (simplified to avoid database issues)
    try {
      await logActivity(
        user.id,
        'LOGIN',
        `User ${user.username} logged in successfully`,
        {
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
      // Continue with login even if logging fails
    }

    // Return user data in the format expected by the frontend
    const response = NextResponse.json({
      success: true,
      staff: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        status: user.status,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        emailNotifications: user.emailNotifications,
        whatsappNotifications: user.whatsappNotifications
      },
      requiresTotp: !!user.totpSecret
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', setAuthCookie(token)['Set-Cookie']);

    // Reset failure counter on success
    resetFailedAttempts(ip);

    return response;
  } catch (error) {
    await logError('Login failed', error as Error, {
      action: 'LOGIN_FAILED',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });
    return handleApiError(error, '/api/staff/login');
  }
} 