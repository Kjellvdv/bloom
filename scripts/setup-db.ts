#!/usr/bin/env tsx
/**
 * Database setup script for Railway deployments
 * Runs migrations and seeds initial data
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';

const execAsync = promisify(exec);

async function checkIfTablesExist(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('⚠️  DATABASE_URL not set, skipping setup');
    return true; // Skip setup if no database configured
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
    return result.rows[0].exists;
  } catch (error) {
    return false;
  } finally {
    await pool.end();
  }
}

async function setupDatabase() {
  console.log('🔧 Starting database setup...');

  try {
    // Check if tables already exist
    const tablesExist = await checkIfTablesExist();

    if (tablesExist) {
      console.log('ℹ️  Database tables already exist, skipping setup');
      process.exit(0);
      return;
    }

    // Run migrations (create tables)
    console.log('📊 Running database migrations...');
    await execAsync('npm run db:push');
    console.log('✅ Migrations completed');

    // Run seeds (populate initial data)
    console.log('🌱 Seeding initial data...');
    await execAsync('npm run seed');
    console.log('✅ Seed data loaded');

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    console.error(error);
    // Don't fail the build, just log the error
    console.log('⚠️  Continuing despite setup failure...');
    process.exit(0);
  }
}

setupDatabase();
