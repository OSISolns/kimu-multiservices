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

  // Manager has all permissions except user write operations
  if (user.role === 'manager') {
    if (resource === 'users' && action !== 'read') {
      return false; // Only allow read access to users
    }
    return true; // All other permissions granted
  }

  // Define role-based permissions
  const rolePermissions: Record<UserRole, Permission[]> = {
    admin: [
      { resource: '*', action: '*' }
    ],
    manager: [
      { resource: '*', action: '*' },
      { resource: 'users', action: 'read' }
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
    ],
    sales: [
      { resource: 'leads', action: '*' },
      { resource: 'quotes', action: '*' },
      { resource: 'bookings', action: 'read' }
    ],
    'transport-officer': [
      { resource: 'vehicles', action: '*' },
      { resource: 'bookings', action: '*' },
      { resource: 'drivers', action: '*' }
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

  // Admin can only access specific admin pages and profile settings
  if (user.role === 'admin') {
    const allowedAdminRoutes = [
      '/staff/admin-dashboard',
      '/staff/system-logs',
      '/staff/users',
      '/staff/reports',
      '/profile',
      '/profile/password',
      '/profile/picture',
    ];
    return allowedAdminRoutes.some((allowed) => route.startsWith(allowed));
  }

  // Manager has access to all routes
  if (user.role === 'manager') {
    return true;
  }

  // Route-based access control for other roles
  const routePermissions: Record<string, UserRole[]> = {
    '/staff/users': [],
    '/staff/vehicles': ['manager', 'staff'],
    '/staff/bookings': ['manager', 'staff', 'agent'],
    '/staff/reports': ['manager', 'staff'],
    '/staff/financial-reports': ['manager', 'accountant'],
    '/staff/accountant-dashboard': ['accountant'],
    '/staff/manager-dashboard': ['manager'],
    '/staff/admin-dashboard': ['admin'],
    '/staff/sales-dashboard': ['staff', 'sales', 'agent'],
    '/staff/transport_officer-dashboard': ['staff', 'transport-officer'],
    '/staff/system-logs': ['admin'],
  };

  for (const [routePattern, allowedRoles] of Object.entries(routePermissions)) {
    if (route.startsWith(routePattern)) {
      return allowedRoles.includes(user.role);
    }
  }

  // Default: staff and above can access staff routes (excluding admin which is already handled)
  if (route.startsWith('/staff/')) {
    return ['manager', 'staff', 'accountant', 'sales', 'transport-officer', 'agent'].includes(user.role);
  }

  return true;
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
