import { Router, Request, Response } from 'express';
import { z } from 'zod';
import type { IStorage } from '../storage';
import { requireAuth } from '../middleware/auth';
import { calculateSimilarity, generateFeedbackMessage, normalizeNumbers } from '../utils/helpers';

export function createExercisesRouter(storage: IStorage) {
  const router = Router();

  // Validation schema for exercise attempts
  const attemptSchema = z.object({
    userResponse: z.string(),
    audioRecordingUrl: z.string().url().optional(),
    attemptDuration: z.number().int().positive().optional(),
  });

  /**
   * GET /api/exercises/:id
   * Get single exercise
   */
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.id);

      console.log('📝 Fetching exercise:', exerciseId);

      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de ejercicio inválido',
        });
      }

      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Ejercicio no encontrado',
        });
      }

      console.log('✅ Exercise fetched:', exerciseId);

      res.json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      console.error('❌ Error fetching exercise:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/exercises/:id/attempt
   * Submit an exercise attempt
   */
  router.post('/:id/attempt', requireAuth, async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('📝 Exercise attempt:', { exerciseId, userId });

      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de ejercicio inválido',
        });
      }

      // Validate request body
      const validatedData = attemptSchema.parse(req.body);
      const { userResponse, audioRecordingUrl, attemptDuration } = validatedData;

      // Get exercise
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Ejercicio no encontrado',
        });
      }

      // Evaluate response based on exercise type
      let isCorrect = false;
      let accuracyScore = 0;

      if (exercise.exerciseType === 'voice_repeat' || exercise.exerciseType === 'voice_answer') {
        // Voice exercise - calculate similarity with number normalization
        const expectedText = exercise.expectedText?.toLowerCase() || '';
        const userText = userResponse.toLowerCase();

        // Normalize numbers in both texts (e.g., "three" -> "3", "3" -> "3")
        const normalizedExpected = normalizeNumbers(expectedText);
        const normalizedUser = normalizeNumbers(userText);

        accuracyScore = calculateSimilarity(normalizedUser, normalizedExpected);
        isCorrect = accuracyScore >= 80;

        console.log('🎤 Voice exercise evaluated:', {
          expected: expectedText,
          user: userText,
          normalizedExpected,
          normalizedUser,
          accuracy: accuracyScore,
          isCorrect,
        });
      } else if (exercise.exerciseType === 'spelling') {
        // Spelling - exact match (case insensitive)
        const expectedText = exercise.expectedText?.toLowerCase() || '';
        const userText = userResponse.toLowerCase().trim();

        isCorrect = userText === expectedText;
        accuracyScore = isCorrect ? 100 : 0;

        console.log('✍️ Spelling exercise evaluated:', {
          expected: expectedText,
          user: userText,
          isCorrect,
        });
      } else if (exercise.exerciseType === 'listening_comprehension') {
        // For listening, check if response matches any of the correct answers
        const correctAnswers = exercise.correctAnswers || [];
        const userText = userResponse.toLowerCase().trim();

        isCorrect = correctAnswers.some(
          (answer) => answer.toLowerCase() === userText
        );
        accuracyScore = isCorrect ? 100 : 0;

        console.log('👂 Listening exercise evaluated:', {
          correctAnswers,
          user: userText,
          isCorrect,
        });
      } else if (exercise.exerciseType === 'translation') {
        // Translation - check against expected text and correct answers
        const expectedText = exercise.expectedText?.toLowerCase() || '';
        const correctAnswers = exercise.correctAnswers || [];
        const userText = userResponse.toLowerCase().trim();

        // Check if matches expected text or any correct answer
        isCorrect = userText === expectedText ||
                    correctAnswers.some(answer => answer.toLowerCase() === userText);

        // For close matches, calculate similarity
        if (!isCorrect && expectedText) {
          accuracyScore = calculateSimilarity(userText, expectedText);
          isCorrect = accuracyScore >= 90; // Higher threshold for translations
        } else {
          accuracyScore = isCorrect ? 100 : 0;
        }

        console.log('🌐 Translation exercise evaluated:', {
          expected: expectedText,
          correctAnswers,
          user: userText,
          accuracy: accuracyScore,
          isCorrect,
        });
      }

      // Save attempt
      const attempt = await storage.createExerciseAttempt({
        userId,
        exerciseId,
        userResponse,
        audioRecordingUrl,
        isCorrect,
        accuracyScore,
        attemptDuration,
      });

      console.log('✅ Attempt saved:', {
        attemptId: attempt.id,
        isCorrect,
        accuracyScore,
      });

      // Update user progress for this level
      await updateUserProgressAfterAttempt(storage, userId, exercise.skillLevelId, isCorrect);

      // Generate feedback message in Spanish
      const feedbackEs = generateFeedbackMessage(
        isCorrect,
        accuracyScore,
        exercise.successMessageEs
      );

      res.json({
        success: true,
        data: {
          attempt,
          feedback: feedbackEs,
          isCorrect,
          accuracyScore,
        },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación inválidos',
          details: error.errors,
        });
      }

      console.error('❌ Error saving exercise attempt:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/exercises/:id/skip
   * Skip an exercise (still tracks it)
   */
  router.post('/:id/skip', requireAuth, async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const userId = req.user!.id;

      console.log('⏭️ Skipping exercise:', exerciseId);

      if (isNaN(exerciseId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de ejercicio inválido',
        });
      }

      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({
          success: false,
          error: 'Ejercicio no encontrado',
        });
      }

      // Create a skip attempt (marked as incorrect with 0 accuracy)
      const attempt = await storage.createExerciseAttempt({
        userId,
        exerciseId,
        userResponse: '[skipped]',
        isCorrect: false,
        accuracyScore: 0,
      });

      console.log('✅ Exercise skipped:', exerciseId);

      res.json({
        success: true,
        data: attempt,
      });
    } catch (error) {
      console.error('❌ Error skipping exercise:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}

/**
 * Helper function to update user progress after an exercise attempt
 */
async function updateUserProgressAfterAttempt(
  storage: IStorage,
  userId: number,
  levelId: number,
  isCorrect: boolean
) {
  try {
    // Get current progress
    const progress = await storage.getUserProgress(userId, levelId);
    if (!progress) {
      console.warn('⚠️ No progress found for user', userId, 'level', levelId);
      return;
    }

    // Update progress statistics
    const newTotalAttempts = progress.totalAttempts + 1;
    const newCorrectAttempts = progress.correctAttempts + (isCorrect ? 1 : 0);
    const newAverageAccuracy = (newCorrectAttempts / newTotalAttempts) * 100;

    // Get total exercises in level to calculate completion percentage
    const exercises = await storage.getExercisesByLevel(levelId);
    const completionPercentage = Math.min(
      100,
      Math.floor((newCorrectAttempts / exercises.length) * 100)
    );

    // Check if level is completed (all exercises done correctly at least once)
    const status = completionPercentage >= 100 ? 'completed' : 'in_progress';

    await storage.updateUserProgress(progress.id, {
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      averageAccuracy: newAverageAccuracy,
      completionPercentage,
      status,
      completedAt: status === 'completed' ? new Date() : progress.completedAt,
      lastAccessedAt: new Date(),
    });

    console.log('✅ Progress updated:', {
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      accuracy: newAverageAccuracy.toFixed(1),
      completion: completionPercentage,
      status,
    });

    // If level completed, unlock next level and create garden message
    if (status === 'completed' && !progress.completedAt) {
      console.log('🎉 Level completed! Unlocking next level...');

      const level = await storage.getLevel(levelId);
      if (level) {
        // Find next level
        const allLevels = await storage.getAllLevels();
        const nextLevel = allLevels.find((l) => l.levelNumber === level.levelNumber + 1);

        if (nextLevel) {
          // Create progress for next level
          const existingProgress = await storage.getUserProgress(userId, nextLevel.id);
          if (!existingProgress) {
            await storage.createUserProgress({
              userId,
              skillLevelId: nextLevel.id,
              status: 'in_progress',
              currentExerciseIndex: 0,
              completionPercentage: 0,
              totalAttempts: 0,
              correctAttempts: 0,
              averageAccuracy: 0,
            });

            console.log('✅ Next level unlocked:', nextLevel.id);
          }
        }

        // Create congratulations message
        await storage.createGardenMessage({
          userId,
          messageType: 'milestone',
          messageTextEs: `¡Felicidades! Completaste "${level.titleEs}". 🌸 Tu jardín está floreciendo.`,
          triggerCondition: 'level_complete',
          isRead: false,
        });

        // Update garden (add flower)
        const garden = await storage.getUserGarden(userId);
        if (garden) {
          await storage.updateUserGarden(userId, {
            totalFlowers: garden.totalFlowers + 1,
            totalWateringSessions: garden.totalWateringSessions + 1,
          });

          console.log('✅ Garden updated with new flower');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error updating progress:', error);
  }
}
