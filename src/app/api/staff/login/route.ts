import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken, setAuthCookie } from '@/lib/jwt';
import { validateInput, loginSchema, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse, createAuthErrorResponse } from '@/lib/errors';
import { hasAnyRole } from '@/lib/utils';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { LoginRequest, LoginResponse, UserRole } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    
    // Validate input
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { username, password } = validation.data!;
    
    // Sanitize input
    const sanitizedUsername = sanitizeString(username);
    const user = await prisma.user.findUnique({ where: { username: sanitizedUsername } });
    if (!user) {
      return createAuthErrorResponse('Invalid username or password');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
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
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log successful login
    await logActivity(
      user.id,
      'LOGIN',
      `User ${user.username} logged in successfully`,
      {
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    );

    await logInfo(`User ${user.username} logged in successfully`, {
      userId: user.id,
      action: 'LOGIN',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

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
        totpSecret: user.totpSecret,
        emailNotifications: user.emailNotifications,
        whatsappNotifications: user.whatsappNotifications
      },
      requiresTotp: !!user.totpSecret
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', setAuthCookie(token)['Set-Cookie']);

    return response;
  } catch (error) {
    await logError('Login failed', error as Error, {
      action: 'LOGIN_FAILED',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });
    return handleApiError(error, '/api/staff/login');
  }
} 