import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

// User validation schemas
export const createUserSchema = z.object({
  username: usernameSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
  role: z.enum(['admin', 'manager', 'staff', 'accountant', 'transport-officer', 'agent']),
  department: z.string().optional(),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  role: z.enum(['admin', 'manager', 'staff', 'accountant', 'transport-officer', 'agent']).optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// Vehicle validation schemas
export const createVehicleSchema = z.object({
  name: z.string().min(2, 'Vehicle name must be at least 2 characters').max(100, 'Vehicle name must be less than 100 characters'),
  type: z.string().min(2, 'Vehicle type must be at least 2 characters'),
  category: z.string().min(2, 'Vehicle category must be at least 2 characters'),
  price: z.string().min(1, 'Price is required'),
  year: z.number().int().min(1900, 'Year must be after 1900').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  engine: z.string().min(1, 'Engine specification is required'),
  mileage: z.string().min(1, 'Mileage is required'),
  transmission: z.string().min(1, 'Transmission type is required'),
  fuel: z.string().min(1, 'Fuel type is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  doors: z.number().int().min(2, 'Must have at least 2 doors').max(6, 'Cannot have more than 6 doors'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  power: z.string().optional(),
  fuelEfficiency: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  licensePlate: z.string().optional(),
  customPlateNumber: z.string().optional(),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  type: z.enum(['Car Rental', 'Hotel', 'Taxi Service', 'Airport Transfer', 'City Tour']),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  nationality: z.string().optional(),
  idOrPassport: z.string().optional(),
  carType: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  rentalDays: z.number().int().min(1, 'Rental days must be at least 1').optional(),
  fullTank: z.boolean().default(false),
});

// Lead validation schemas
export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters').max(100, 'Company must be less than 100 characters'),
  stage: z.enum(['Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']).default('Contacted'),
  value: z.number().min(0, 'Value must be positive').default(0),
  contact: phoneSchema.optional(),
  email: emailSchema.optional(),
  location: z.string().optional(),
  nextFollowUp: z.string().datetime().optional(),
});

// Login validation schema
export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required'),
});

// Utility functions for validation
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"]/g, ''); // Remove quotes to prevent injection
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim();
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// CSRF protection helper
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0;
}
