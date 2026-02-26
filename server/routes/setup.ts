import { Router, Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { getStorage } from '../storage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function createSetupRouter() {
  const router = Router();

  /**
   * POST /api/setup/initialize
   * One-time database setup - creates tables and seeds data
   * Visit this endpoint once after deployment
   */
  router.post('/initialize', async (req: Request, res: Response) => {
    try {
      console.log('🔧 Database initialization requested...');

      const storage = getStorage();

      // Check if already initialized
      try {
        const levels = await storage.getAllLevels();
        if (levels.length > 0) {
          return res.json({
            success: true,
            message: 'Database already initialized!',
            levelsCount: levels.length,
          });
        }
      } catch (error) {
        // Tables don't exist yet, continue with setup
        console.log('Tables not found, creating...');
      }

      // Run seed script (which will create tables if they don't exist)
      console.log('🌱 Running seed script...');
      const { stdout, stderr } = await execAsync('npx tsx server/seeds/initial-levels.ts');

      console.log('Seed output:', stdout);
      if (stderr) console.log('Seed stderr:', stderr);

      // Verify it worked
      const levels = await storage.getAllLevels();

      res.json({
        success: true,
        message: 'Database initialized successfully!',
        levelsCreated: levels.length,
        details: 'Tables created and seed data loaded',
      });

      console.log('✅ Database initialization complete!');
    } catch (error: any) {
      console.error('❌ Database initialization failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: error.toString(),
      });
    }
  });

  /**
   * GET /api/setup/status
   * Check if database is initialized
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const levels = await storage.getAllLevels();

      res.json({
        success: true,
        initialized: levels.length > 0,
        levelsCount: levels.length,
      });
    } catch (error: any) {
      res.json({
        success: false,
        initialized: false,
        error: 'Tables not created yet',
      });
    }
  });

  return router;
}
