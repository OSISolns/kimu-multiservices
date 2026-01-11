import { UserRole } from '@/types/api';

// Role checking utilities
export function hasRole(user: { role: UserRole } | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function hasAnyRole(user: { role: UserRole } | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

export function isAdmin(user: { role: UserRole } | null): boolean {
  return user?.role === 'admin';
}

export function isStaff(user: { role: UserRole } | null): boolean {
  if (!user) return false;
  return ['admin', 'manager', 'staff', 'accountant', 'transport-officer'].includes(user.role);
}

export function isManager(user: { role: UserRole } | null): boolean {
  if (!user) return false;
  return ['admin', 'manager'].includes(user.role);
}

// Permission checking utilities
export function hasPermission(
  user: { role: UserRole } | null,
  resource: string,
  action: string
): boolean {
  if (!user) return false;

  // Admin has all permissions
  if (user.role === 'admin') return true;

  // Define role-based permissions
  const rolePermissions: Record<UserRole, Array<{ resource: string; action: string }>> = {
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
    'transport-officer': [
      { resource: 'vehicles', action: '*' },
      { resource: 'bookings', action: '*' },
      { resource: 'reports', action: 'read' }
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
    'sales-representative': [
      { resource: 'vehicles', action: 'read' },
      { resource: 'bookings', action: 'create' },
      { resource: 'bookings', action: 'read' },
      { resource: 'leads', action: '*' }
    ],
    driver: [
      { resource: 'vehicles', action: 'read' },
      { resource: 'bookings', action: 'read' }
    ],
    'customer-service': [
      { resource: 'vehicles', action: 'read' },
      { resource: 'bookings', action: '*' },
      { resource: 'reports', action: 'read' }
    ],
    operations: [
      { resource: 'vehicles', action: '*' },
      { resource: 'bookings', action: '*' },
      { resource: 'reports', action: 'read' }
    ]
  };

  const permissions = rolePermissions[user.role] || [];

  return permissions.some(permission =>
    (permission.resource === '*' || permission.resource === resource) &&
    (permission.action === '*' || permission.action === action)
  );
}

// String utilities
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `+250 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('250')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  return phone; // Return original if format is not recognized
}

export function formatCurrency(amount: number, currency: string = 'RWF'): string {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-RW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Array utilities
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Object utilities
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}

export function isValidRwandanPlate(plate: string): boolean {
  const plateRegex = /^RA[A-Z]\s?\d{3}\s?[A-Z]$/;
  return plateRegex.test(plate.toUpperCase());
}

// Date utilities
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate;
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Number utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function roundToDecimal(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Pagination utilities
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
} {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    offset,
  };
}

// File utilities
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// URL utilities
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Environment utilities
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}
