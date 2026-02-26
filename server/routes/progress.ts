import { Router, Request, Response } from 'express';
import type { IStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

export function createProgressRouter(storage: IStorage) {
  const router = Router();

  /**
   * GET /api/progress
   * Get overall progress summary for current user
   */
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('📊 Fetching progress for user:', userId);

      const allProgress = await storage.getAllUserProgress(userId);

      console.log(`✅ Fetched progress for ${allProgress.length} levels`);

      res.json({
        success: true,
        data: allProgress,
      });
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * GET /api/progress/stats
   * Get detailed learning statistics
   */
  router.get('/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('📊 Fetching stats for user:', userId);

      const stats = await storage.getProgressStats(userId);

      console.log('✅ Stats fetched:', {
        levelsCompleted: stats.totalLevelsCompleted,
        exercisesCompleted: stats.totalExercisesCompleted,
        avgAccuracy: stats.averageAccuracy.toFixed(1),
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * GET /api/progress/levels/:id
   * Get detailed progress for a specific level
   */
  router.get('/levels/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const levelId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('📊 Fetching progress for level:', levelId);

      if (isNaN(levelId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de nivel inválido',
        });
      }

      const progress = await storage.getUserProgress(userId, levelId);

      if (!progress) {
        return res.status(404).json({
          success: false,
          error: 'Progreso no encontrado',
        });
      }

      console.log('✅ Progress fetched for level:', levelId);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('❌ Error fetching level progress:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}
