import { prisma } from './prisma';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  userId?: number;
  action?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log an error message
   */
  async error(
    message: string,
    error?: Error,
    metadata?: {
      userId?: number;
      action?: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      error,
      ...metadata
    });
  }

  /**
   * Log a warning message
   */
  async warn(
    message: string,
    metadata?: {
      userId?: number;
      action?: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.log({
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      ...metadata
    });
  }

  /**
   * Log an info message
   */
  async info(
    message: string,
    metadata?: {
      userId?: number;
      action?: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      ...metadata
    });
  }

  /**
   * Log a debug message
   */
  async debug(
    message: string,
    metadata?: {
      userId?: number;
      action?: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    if (this.isDevelopment) {
      await this.log({
        level: LogLevel.DEBUG,
        message,
        timestamp: new Date(),
        ...metadata
      });
    }
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId: number,
    action: string,
    details?: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          details,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Log system events
   */
  async logSystem(
    action: string,
    details?: string,
    createdBy?: number
  ): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          action,
          details,
          createdBy,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  /**
   * Internal log method
   */
  private async log(entry: LogEntry): Promise<void> {
    // Console logging for development
    if (this.isDevelopment) {
      const logMessage = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}] ${entry.message}`;
      
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(logMessage, entry.error, entry.metadata);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, entry.metadata);
          break;
        case LogLevel.INFO:
          console.info(logMessage, entry.metadata);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, entry.metadata);
          break;
      }
    }

    // In production, you might want to send logs to an external service
    // like Winston, Pino, or a cloud logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external logging service
      // await this.sendToExternalService(entry);
    }
  }

  /**
   * Get logs for a specific user
   */
  async getUserLogs(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      return await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Failed to get user logs:', error);
      return [];
    }
  }

  /**
   * Get system logs
   */
  async getSystemLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      return await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Failed to get system logs:', error);
      return [];
    }
  }

  /**
   * Clean up old logs (run as a cron job)
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      await prisma.systemLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      await this.info(`Cleaned up logs older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);
export const logActivity = logger.logActivity.bind(logger);
export const logSystem = logger.logSystem.bind(logger);
