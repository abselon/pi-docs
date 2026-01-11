/**
 * Script to check database connection and migration status
 * Run with: npx tsx scripts/check-db.ts
 */
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

async function checkDatabase() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('Checking database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');

    console.log('\nChecking if migrations are applied...');
    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `;

    const expectedTables = ['User', 'UserSettings', 'Category', 'Document', '_prisma_migrations'];
    const existingTables = result.map((r) => r.tablename);

    console.log('\nExisting tables:', existingTables.join(', '));

    const missingTables = expectedTables.filter((t) => !existingTables.includes(t));
    if (missingTables.length > 0) {
      console.log('\n⚠ Missing tables:', missingTables.join(', '));
      console.log('\nPlease run: npm run prisma:migrate');
      process.exit(1);
    } else {
      console.log('\n✓ All required tables exist');
    }

    // Check if we can query User table
    try {
      const userCount = await prisma.user.count();
      console.log(`✓ User table is accessible (${userCount} users)`);
    } catch (err) {
      console.error('\n✗ Error accessing User table:', err);
      console.log('\nPlease run: npm run prisma:migrate');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Database connection failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('connect')) {
        console.error('\nPossible issues:');
        console.error('1. DATABASE_URL is not set or incorrect');
        console.error('2. Database server is not running');
        console.error('3. Network/firewall issues');
        console.error('\nPlease check your .env file and ensure DATABASE_URL is correct');
      } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.error('\nDatabase tables are missing. Please run: npm run prisma:migrate');
      }
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
