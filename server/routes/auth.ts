import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { insertUserSchema, safeUserSchema, type SafeUser } from '../../shared/schema';
import type { IStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

export function createAuthRouter(storage: IStorage) {
  const router = Router();

  /**
   * POST /api/auth/register
   * Register a new user with garden initialization
   */
  router.post('/register', async (req: Request, res: Response) => {
    try {
      console.log('📝 Registration attempt:', { email: req.body.email });

      const { email, displayName, password, nativeLanguage, targetLanguage } = req.body;

      // Validate password
      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres',
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'El correo electrónico ya está en uso',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        displayName,
        passwordHash,
        nativeLanguage: nativeLanguage || 'es',
        targetLanguage: targetLanguage || 'en',
        reminderEnabled: true,
      });

      console.log('✅ User created:', user.id);

      // Initialize garden for new user
      await storage.createUserGarden({
        userId: user.id,
        gardenTheme: 'spring',
        totalFlowers: 0,
        totalWateringSessions: 0,
        gardenLevel: 1,
        plantPositions: [],
        unlockedTools: [],
      });

      console.log('✅ Garden initialized for user:', user.id);

      // Initialize streak tracking
      await storage.createUserStreak({
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
      });

      console.log('✅ Streak tracking initialized for user:', user.id);

      // Initialize progress for level 1 (unlock first level)
      const levels = await storage.getAllLevels();
      if (levels.length > 0) {
        await storage.createUserProgress({
          userId: user.id,
          skillLevelId: levels[0].id,
          status: 'in_progress',
          currentExerciseIndex: 0,
          completionPercentage: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          averageAccuracy: 0,
        });

        console.log('✅ Level 1 unlocked for user:', user.id);
      }

      // Create welcome message
      await storage.createGardenMessage({
        userId: user.id,
        messageType: 'welcome',
        messageTextEs: '¡Bienvenido a tu jardín! 🌱 Cada palabra que aprendas es una semilla plantada. ¡Comencemos a crecer juntos!',
        triggerCondition: 'registration',
        isRead: false,
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error('❌ Error logging in after registration:', err);
          return res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión',
          });
        }

        // Return safe user data
        const safeUser: SafeUser = {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nativeLanguage: user.nativeLanguage,
          targetLanguage: user.targetLanguage,
          profileImage: user.profileImage,
          reminderEnabled: user.reminderEnabled,
          reminderTime: user.reminderTime,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        console.log('✅ User logged in successfully:', user.id);

        res.status(201).json({
          success: true,
          data: safeUser,
        });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación inválidos',
          details: error.errors,
        });
      }

      console.error('❌ Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      console.log('📝 Login attempt:', { email });

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos',
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Email o contraseña incorrectos',
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: 'Email o contraseña incorrectos',
        });
      }

      // Login user
      req.login(user, (err) => {
        if (err) {
          console.error('❌ Error logging in:', err);
          return res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión',
          });
        }

        // Return safe user data
        const safeUser: SafeUser = {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          nativeLanguage: user.nativeLanguage,
          targetLanguage: user.targetLanguage,
          profileImage: user.profileImage,
          reminderEnabled: user.reminderEnabled,
          reminderTime: user.reminderTime,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        console.log('✅ User logged in successfully:', user.id);

        res.json({
          success: true,
          data: safeUser,
        });
      });
    } catch (error) {
      console.error('❌ Error logging in:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  router.post('/logout', (req: Request, res: Response) => {
    console.log('📝 Logout request');

    req.logout((err) => {
      if (err) {
        console.error('❌ Error logging out:', err);
        return res.status(500).json({
          success: false,
          error: 'Error al cerrar sesión',
        });
      }

      console.log('✅ User logged out successfully');

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  router.get('/me', requireAuth, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
    }

    // Fetch full user data from database
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      nativeLanguage: user.nativeLanguage,
      targetLanguage: user.targetLanguage,
      profileImage: user.profileImage,
      reminderEnabled: user.reminderEnabled,
      reminderTime: user.reminderTime,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      success: true,
      data: safeUser,
    });
  });

  /**
   * PUT /api/auth/profile
   * Update user profile
   */
  router.put('/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { displayName, profileImage } = req.body;

      console.log('📝 Updating profile for user:', userId);

      const updatedUser = await storage.updateUser(userId, {
        displayName,
        profileImage,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      const safeUser: SafeUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        nativeLanguage: updatedUser.nativeLanguage,
        targetLanguage: updatedUser.targetLanguage,
        profileImage: updatedUser.profileImage,
        reminderEnabled: updatedUser.reminderEnabled,
        reminderTime: updatedUser.reminderTime,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      console.log('✅ Profile updated successfully');

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  /**
   * PUT /api/auth/preferences
   * Update reminder preferences
   */
  router.put('/preferences', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { reminderEnabled, reminderTime } = req.body;

      console.log('📝 Updating preferences for user:', userId);

      const updatedUser = await storage.updateUser(userId, {
        reminderEnabled,
        reminderTime,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      const safeUser: SafeUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        nativeLanguage: updatedUser.nativeLanguage,
        targetLanguage: updatedUser.targetLanguage,
        profileImage: updatedUser.profileImage,
        reminderEnabled: updatedUser.reminderEnabled,
        reminderTime: updatedUser.reminderTime,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      console.log('✅ Preferences updated successfully');

      res.json({
        success: true,
        data: safeUser,
      });
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
      });
    }
  });

  return router;
}
