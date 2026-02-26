import { Router, Request, Response } from 'express';
import type { IStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

export function createLevelsRouter(storage: IStorage) {
  const router = Router();

  /**
   * GET /api/levels
   * Get all skill levels with user progress
   */
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('📚 Fetching levels with progress for user:', userId);

      const levelsWithProgress = await storage.getLevelsWithProgress(userId);

      console.log(`✅ Fetched ${levelsWithProgress.length} levels`);

      res.json({
        success: true,
        data: levelsWithProgress,
      });
    } catch (error) {
      console.error('❌ Error fetching levels:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * GET /api/levels/:id
   * Get single level with details
   */
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const levelId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('📚 Fetching level:', levelId, 'for user:', userId);

      if (isNaN(levelId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de nivel inválido',
        });
      }

      const level = await storage.getLevel(levelId);
      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Nivel no encontrado',
        });
      }

      // Get user progress for this level
      const progress = await storage.getUserProgress(userId, levelId);

      // Get exercises count
      const exercises = await storage.getExercisesByLevel(levelId);

      console.log(`✅ Level ${levelId} fetched with ${exercises.length} exercises`);

      res.json({
        success: true,
        data: {
          ...level,
          progress,
          exerciseCount: exercises.length,
        },
      });
    } catch (error) {
      console.error('❌ Error fetching level:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * GET /api/levels/:id/exercises
   * Get all exercises for a level
   */
  router.get('/:id/exercises', requireAuth, async (req: Request, res: Response) => {
    try {
      const levelId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('📝 Fetching exercises for level:', levelId);

      if (isNaN(levelId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de nivel inválido',
        });
      }

      const exercises = await storage.getExercisesByLevel(levelId);

      console.log(`✅ Fetched ${exercises.length} exercises`);

      res.json({
        success: true,
        data: exercises,
      });
    } catch (error) {
      console.error('❌ Error fetching exercises:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/levels/:id/start
   * Start a level (create or update progress record)
   */
  router.post('/:id/start', requireAuth, async (req: Request, res: Response) => {
    try {
      const levelId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('🎯 Starting level:', levelId, 'for user:', userId);

      if (isNaN(levelId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de nivel inválido',
        });
      }

      // Check if level exists
      const level = await storage.getLevel(levelId);
      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Nivel no encontrado',
        });
      }

      // Check if progress already exists
      let progress = await storage.getUserProgress(userId, levelId);

      if (progress) {
        // Update last accessed time
        progress = await storage.updateUserProgress(progress.id, {
          lastAccessedAt: new Date(),
        });

        console.log('✅ Progress updated for existing level');
      } else {
        // Create new progress record
        progress = await storage.createUserProgress({
          userId,
          skillLevelId: levelId,
          status: 'in_progress',
          currentExerciseIndex: 0,
          completionPercentage: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          averageAccuracy: 0,
          startedAt: new Date(),
        });

        console.log('✅ New progress created for level');
      }

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('❌ Error starting level:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}
