import { NextResponse } from 'next/server';

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// Error handler for API routes
export function handleApiError(error: unknown, path?: string): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'An unexpected error occurred';
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with this information already exists';
        details = { field: prismaError.meta?.target };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference to related record';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Invalid relation operation';
        break;
      default:
        statusCode = 500;
        message = 'Database operation failed';
    }
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path,
  };

  if (details) {
    errorResponse.details = details;
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

// Success response interface
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
}

// Success response helper
export function createSuccessResponse<T>(
  data?: T, 
  message?: string
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response);
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Validation error helper
export function createValidationErrorResponse(
  errors: string[]
): NextResponse<ErrorResponse> {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  }, { status: 400 });
}

// Authentication error helper
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): NextResponse<ErrorResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, { status: 401 });
}

// Authorization error helper
export function createAuthzErrorResponse(
  message: string = 'Insufficient permissions'
): NextResponse<ErrorResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, { status: 403 });
}

// Not found error helper
export function createNotFoundErrorResponse(
  message: string = 'Resource not found'
): NextResponse<ErrorResponse> {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  }, { status: 404 });
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
}
