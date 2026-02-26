import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';
import bcrypt from 'bcrypt';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { initStorage } from './storage';
import { createAuthRouter } from './routes/auth';
import { createLevelsRouter } from './routes/levels';
import { createExercisesRouter } from './routes/exercises';
import { createProgressRouter } from './routes/progress';
import { createGardenRouter } from './routes/garden';
import { createSetupRouter } from './routes/setup';
import type { User } from '../shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('🚀 Starting Bloom server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('🔌 Database URL:', DATABASE_URL ? 'Set' : 'Missing');

// Initialize storage
const storage = initStorage(DATABASE_URL);

// Session store
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: new Pool({ connectionString: DATABASE_URL }),
  tableName: 'session',
  createTableIfMissing: true,
});

// CORS configuration
const corsOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || true // Allow same-origin in production
    : 'http://localhost:5173';

console.log('🌐 CORS origin:', corsOrigin);

// Middleware
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'bloom-secret-key-change-in-production';
console.log('🔐 Session secret:', sessionSecret === 'bloom-secret-key-change-in-production' ? 'Using default (change in production!)' : 'Set');

app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport LocalStrategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        console.log('🔑 Passport authentication attempt:', { email });

        // Find user by email
        const user = await storage.getUserByEmail(email);

        if (!user) {
          console.log('❌ User not found:', email);
          return done(null, false, { message: 'Email o contraseña incorrectos' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          console.log('❌ Invalid password for user:', email);
          return done(null, false, { message: 'Email o contraseña incorrectos' });
        }

        console.log('✅ Authentication successful:', email);
        return done(null, user);
      } catch (err) {
        console.error('❌ Passport authentication error:', err);
        return done(err);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  console.log('📦 Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    console.log('📦 Deserializing user:', id);
    const user = await storage.getUserById(id);

    if (!user) {
      console.log('❌ User not found during deserialization:', id);
      return done(null, false);
    }

    // Return safe user without password hash
    const safeUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      nativeLanguage: user.nativeLanguage,
      targetLanguage: user.targetLanguage,
    };

    console.log('✅ User deserialized successfully:', id);
    done(null, safeUser);
  } catch (err) {
    console.error('❌ Deserialization error:', err);
    done(err);
  }
});

// Session check logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`🔑 Session check for ${req.method} ${req.path}:`, {
      hasSession: !!req.session,
      sessionID: req.sessionID,
      isAuthenticated: req.isAuthenticated?.() ?? false,
      user: req.user ? `User ${req.user.id}` : 'No user',
    });
  }
  next();
});

// Routes
app.use('/api/auth', createAuthRouter(storage));
app.use('/api/levels', createLevelsRouter(storage));
app.use('/api/exercises', createExercisesRouter(storage));
app.use('/api/progress', createProgressRouter(storage));
app.use('/api/garden', createGardenRouter(storage));
app.use('/api/setup', createSetupRouter());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bloom server is running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Database setup endpoint (one-time use)
// Visit this endpoint once after deployment to initialize database
app.get('/api/setup-database', async (req, res) => {
  try {
    console.log('🔧 Database setup requested...');

    // Check if tables already exist
    const levels = await storage.getAllLevels();
    if (levels.length > 0) {
      return res.json({
        success: true,
        message: 'Database already set up!',
        levelsCount: levels.length,
      });
    }

    return res.json({
      success: false,
      error: 'Please run: railway run npm run db:push && railway run npm run seed',
      instructions: {
        step1: 'Install Railway CLI: npm install -g @railway/cli',
        step2: 'Link project: railway link',
        step3: 'Run migrations: railway run npm run db:push',
        step4: 'Run seeds: railway run npm run seed',
      },
    });
  } catch (error: any) {
    console.error('❌ Setup check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../dist/client');

  console.log('📁 Serving static files from:', clientDistPath);

  // Serve static assets
  app.use(express.static(clientDistPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('❌ Error:', err);

    const message =
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message;

    res.status(500).json({ success: false, error: message });
  }
);

// Start server
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, host, () => {
  console.log(`✅ Bloom server running on http://${host}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${corsOrigin}`);
});

export default app;
