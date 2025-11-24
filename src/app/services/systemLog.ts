import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SystemLogData {
  action: string;
  details?: any;
  createdBy?: number;
}

export async function logSystemEvent(data: SystemLogData) {
  try {
    await prisma.systemLog.create({
      data: {
        action: data.action,
        details: data.details ? JSON.stringify(data.details) : null,
        createdBy: data.createdBy,
      },
    });
  } catch (error) {
    console.error('Error logging system event:', error);
  }
}

export const SystemActions = {
  DB_BACKUP: 'db_backup',
  USER_USAGE_REPORT: 'user_usage_report',
  SYSTEM_UPDATE: 'system_update',
  MANUAL_LOG: 'manual_log',
} as const; 