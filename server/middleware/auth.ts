import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      displayName: string;
      nativeLanguage: string;
      targetLanguage: string;
    }
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Autenticación requerida',
    });
  }
  next();
}
