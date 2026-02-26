/**
 * Ensure database is set up on server start
 * Runs migrations and seeds if tables don't exist
 */

import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let setupComplete = false;

async function checkIfTablesExist(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('⚠️  DATABASE_URL not set');
    return false;
  }

  // Debug: show connection details (without password)
  try {
    const url = new URL(connectionString);
    console.log('🔗 Connecting to database:', {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      database: url.pathname.slice(1),
    });
  } catch (e) {
    console.log('⚠️  Could not parse DATABASE_URL');
  }

  const pool = new Pool({ connectionString });

  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    console.log('✅ Database connection successful');
    return result.rows[0].exists;
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  } finally {
    await pool.end();
  }
}

export async function ensureDbSetup() {
  // Only run once
  if (setupComplete) {
    return;
  }

  try {
    console.log('🔍 Checking if database tables exist...');

    const tablesExist = await checkIfTablesExist();

    if (tablesExist) {
      console.log('✅ Database tables already exist');
      setupComplete = true;
      return;
    }

    console.log('📊 Tables not found, running database setup...');

    // Run migrations
    console.log('Creating tables...');
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync('npx drizzle-kit push');
    console.log('Migration output:', pushStdout);
    if (pushStderr) console.log('Migration stderr:', pushStderr);
    console.log('✅ Tables created');

    // Run seeds
    console.log('🌱 Loading seed data...');
    const { stdout: seedStdout, stderr: seedStderr } = await execAsync('npx tsx server/seeds/initial-levels.ts');
    if (seedStderr) console.log('seed output:', seedStderr);
    console.log('✅ Seed data loaded');

    setupComplete = true;
    console.log('🎉 Database setup complete!');
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Please run manually: npm run db:push && npm run seed');
  }
}
