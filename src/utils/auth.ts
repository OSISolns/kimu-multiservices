// Authentication utility functions for KIMU Transport & Multiservices

import { AuthUser, UserRole, Permission } from '@/types/auth';

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: AuthUser | null, 
  resource: string, 
  action: string
): boolean {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Define role-based permissions
  const rolePermissions: Record<UserRole, Permission[]> = {
    admin: [
      { resource: '*', action: '*' }
    ],
    manager: [
      { resource: 'vehicles', action: '*' },
      { resource: 'bookings', action: '*' },
      { resource: 'users', action: 'read' },
      { resource: 'reports', action: '*' },
      { resource: 'financial', action: 'read' }
    ],
    accountant: [
      { resource: 'financial', action: '*' },
      { resource: 'reports', action: 'read' },
      { resource: 'bookings', action: 'read' },
      { resource: 'payments', action: '*' },
      { resource: 'expenses', action: '*' },
      { resource: 'income', action: '*' }
    ],
    staff: [
      { resource: 'vehicles', action: 'read' },
      { resource: 'bookings', action: '*' },
      { resource: 'reports', action: 'read' }
    ],
    agent: [
      { resource: 'vehicles', action: 'read' },
      { resource: 'bookings', action: 'create' },
      { resource: 'bookings', action: 'read' }
    ]
  };
  
  const permissions = rolePermissions[user.role] || [];
  
  return permissions.some(permission => 
    (permission.resource === '*' || permission.resource === resource) &&
    (permission.action === '*' || permission.action === action)
  );
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Unknown User';
  return user.fullName || user.username;
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'U';
  if (user.fullName) {
    return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return user.username.charAt(0).toUpperCase();
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  user: AuthUser | null, 
  route: string
): boolean {
  if (!user) return false;
  
  // Public routes
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(route)) return true;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Route-based access control
  const routePermissions: Record<string, UserRole[]> = {
    '/staff/users': ['admin', 'manager'],
    '/staff/vehicles': ['admin', 'manager', 'staff'],
    '/staff/bookings': ['admin', 'manager', 'staff', 'agent'],
    '/staff/reports': ['admin', 'manager', 'staff'],
    '/staff/financial-reports': ['admin', 'manager', 'accountant'],
    '/staff/accountant-dashboard': ['admin', 'accountant'],
    '/admin': ['admin']
  };
  
  for (const [routePattern, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(routePattern)) {
      return allowedRoles.includes(user.role);
    }
  }
  
  // Default: staff and above can access staff routes
  if (route.startsWith('/staff/')) {
    return ['admin', 'manager', 'staff', 'accountant'].includes(user.role);
  }
  
  return true;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Sanitize user input for security
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
}
