import { Router, Request, Response } from 'express';
import type { IStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

export function createGardenRouter(storage: IStorage) {
  const router = Router();

  /**
   * GET /api/garden
   * Get user's garden state
   */
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('🌸 Fetching garden for user:', userId);

      let garden = await storage.getUserGarden(userId);

      // If no garden exists, create one (shouldn't happen due to registration)
      if (!garden) {
        garden = await storage.createUserGarden({
          userId,
          gardenTheme: 'spring',
          totalFlowers: 0,
          totalWateringSessions: 0,
          gardenLevel: 1,
          plantPositions: [],
          unlockedTools: [],
        });
      }

      console.log('✅ Garden fetched:', garden.id);

      res.json({
        success: true,
        data: garden,
      });
    } catch (error) {
      console.error('❌ Error fetching garden:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * PUT /api/garden
   * Update garden state
   */
  router.put('/', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;

      console.log('🌸 Updating garden for user:', userId);

      const updatedGarden = await storage.updateUserGarden(userId, updates);

      if (!updatedGarden) {
        return res.status(404).json({
          success: false,
          error: 'Jardín no encontrado',
        });
      }

      console.log('✅ Garden updated:', updatedGarden.id);

      res.json({
        success: true,
        data: updatedGarden,
      });
    } catch (error) {
      console.error('❌ Error updating garden:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/garden/water
   * Record a watering session (after completing exercises)
   */
  router.post('/water', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      console.log('💧 Recording watering session for user:', userId);

      const garden = await storage.getUserGarden(userId);
      if (!garden) {
        return res.status(404).json({
          success: false,
          error: 'Jardín no encontrado',
        });
      }

      // Increment watering sessions
      const updatedGarden = await storage.updateUserGarden(userId, {
        totalWateringSessions: garden.totalWateringSessions + 1,
      });

      // Update streak
      let streak = await storage.getUserStreak(userId);
      if (!streak) {
        streak = await storage.createUserStreak({
          userId,
          currentStreak: 1,
          longestStreak: 1,
        });
      } else {
        const lastSession = streak.lastSessionDate;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let newCurrentStreak = streak.currentStreak;
        if (lastSession && lastSession > oneDayAgo) {
          // Same day or consecutive day
          const isSameDay =
            lastSession.toDateString() === now.toDateString();
          if (!isSameDay) {
            newCurrentStreak += 1;
          }
        } else {
          // Streak broken, restart
          newCurrentStreak = 1;
        }

        const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

        await storage.updateUserStreak(userId, {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastSessionDate: now,
        });
      }

      console.log('✅ Watering session recorded');

      res.json({
        success: true,
        data: updatedGarden,
      });
    } catch (error) {
      console.error('❌ Error recording watering session:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * GET /api/garden/messages
   * Get unread garden messages
   */
  router.get('/messages', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      console.log('💬 Fetching messages for user:', userId);

      const messages = await storage.getUnreadMessages(userId);

      console.log(`✅ Fetched ${messages.length} unread messages`);

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/garden/messages/:id/read
   * Mark a message as read
   */
  router.post('/messages/:id/read', requireAuth, async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);

      console.log('💬 Marking message as read:', messageId);

      if (isNaN(messageId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de mensaje inválido',
        });
      }

      await storage.markMessageRead(messageId);

      console.log('✅ Message marked as read');

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}
