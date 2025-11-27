import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

// Global cache to preserve Prisma instance across hot‑reloads (e.g., in dev mode)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Initialise a PrismaClient instance.
 * - In production (or when Turso credentials are present) we connect to Turso via the libSQL adapter.
 * - Otherwise we fall back to a local SQLite database (dev.db).
 */
function initializePrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    console.log('🚀 Initialising Prisma with Turso libSQL adapter');
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }

  // Development fallback – local SQLite file
  console.log('📁 Using local SQLite database');
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
      },
    },
  });
}

// Export a singleton Prisma client
export const prisma = globalForPrisma.prisma ?? initializePrismaClient();

// In non‑production environments keep the instance on the global object for hot‑reload safety
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** Utility helpers */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation failed (attempt ${i + 1}/${maxRetries}):`, error);
      if (i < maxRetries - 1) {
        await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError!;
}
