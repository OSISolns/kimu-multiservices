import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ActivityLogData {
  userId?: number;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(data: ActivityLogData) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

// Predefined action types for consistency
export const ActivityActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  PASSWORD_CHANGE: 'password_change',
  
  // Bookings
  BOOKING_CREATED: 'booking_created',
  BOOKING_UPDATED: 'booking_updated',
  BOOKING_DELETED: 'booking_deleted',
  BOOKING_STATUS_CHANGED: 'booking_status_changed',
  
  // Vehicles
  VEHICLE_ADDED: 'vehicle_added',
  VEHICLE_UPDATED: 'vehicle_updated',
  VEHICLE_DELETED: 'vehicle_deleted',
  VEHICLE_STATUS_CHANGED: 'vehicle_status_changed',
  
  // Notifications
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  
  // User Management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // System
  SYSTEM_MAINTENANCE: 'system_maintenance',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  
  // Settings
  SETTINGS_UPDATED: 'settings_updated',
  NOTIFICATION_PREFERENCES_CHANGED: 'notification_preferences_changed',
} as const;

// Helper function to get user ID from request headers or session
export function getUserIdFromRequest(req: any): number | undefined {
  // This is a placeholder - implement based on your authentication system
  // You might get this from JWT token, session, or other auth mechanism
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Parse JWT or other token to get user ID
    // For now, return undefined
  }
  return undefined;
}

// Helper function to get IP address from request
export function getIpAddress(req: any): string | undefined {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         req.ip || 
         undefined;
}

// Helper function to get user agent from request
export function getUserAgent(req: any): string | undefined {
  return req.headers.get('user-agent') || undefined;
} 