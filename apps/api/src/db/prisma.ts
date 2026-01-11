import { PrismaClient } from '@prisma/client';
import { AppError } from '../lib/errors';
import { env } from '../config/env';

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!env.DATABASE_URL) {
    throw new AppError({
      status: 500,
      code: 'DB_NOT_CONFIGURED',
      message:
        'DATABASE_URL is not configured. Set DATABASE_URL in apps/api/.env (see apps/api/env.example).',
    });
  }
  if (!prisma) {
    prisma = new PrismaClient({
      log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
}

// Gracefully disconnect Prisma on shutdown
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectPrisma();
  });
  
  process.on('SIGINT', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}
