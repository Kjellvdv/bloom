# 🌱 Bloom Deployment Guide

Complete guide for deploying Bloom to production.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

## Local Development Setup

### 1. Install Dependencies

```bash
cd /workspace/bloom
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bloom

# Session
SESSION_SECRET=your-random-secret-key-here

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb bloom
```

Push the schema to the database:

```bash
npm run db:push
```

Seed initial content (3 levels with 41 exercises):

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

This starts both:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 5. Test the Application

1. Visit http://localhost:5173
2. Register a new account
3. Complete some exercises
4. Watch your garden grow!

## Production Deployment

### Option 1: Railway (Recommended)

Railway automatically detects Node.js apps and provides PostgreSQL.

#### Steps:

1. **Push to GitHub:**
   ```bash
   cd /workspace/bloom
   git init
   git add .
   git commit -m "Initial commit: Bloom English learning app"
   git branch -M main
   git remote add origin https://github.com/yourusername/bloom.git
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Bloom repository
   - Railway will automatically:
     - Detect the Node.js app
     - Run `npm install`
     - Run `npm run build`
     - Start with `npm start`

3. **Add PostgreSQL:**
   - In Railway dashboard, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

4. **Set Environment Variables:**
   In Railway dashboard, add:
   ```
   SESSION_SECRET=<generate-a-random-string>
   NODE_ENV=production
   CLIENT_URL=https://your-app.up.railway.app
   ```

5. **Run Database Migrations:**
   In Railway, go to your service → Settings → Deploy Triggers
   Add build command:
   ```bash
   npm run build && npm run db:push && npm run seed
   ```

6. **Access Your App:**
   Railway provides a URL: `https://your-app.up.railway.app`

### Option 2: Vercel (Frontend) + Railway (Backend)

If you want to split frontend/backend:

#### Backend on Railway:
- Follow steps above for Railway
- Note your backend URL

#### Frontend on Vercel:
```bash
# Update API_BASE in client/src/lib/api.ts to your Railway backend URL
vercel deploy
```

### Option 3: Render

1. Create account at https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add PostgreSQL database
   - Set environment variables

## Environment Variables Reference

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for sessions (generate with `openssl rand -base64 32`)
- `NODE_ENV` - `development` or `production`

### Optional

- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origins (default: http://localhost:5173)

### Future (Phase 6+)

- `OPENAI_API_KEY` - For Whisper API (advanced voice evaluation)
- `AWS_ACCESS_KEY_ID` - For S3 audio storage
- `AWS_SECRET_ACCESS_KEY` - For S3 audio storage
- `S3_BUCKET` - S3 bucket name
- `ELEVENLABS_API_KEY` - For TTS audio generation

## Database Commands

```bash
# Generate migration
npm run db:generate

# Push schema changes
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed initial data
npm run seed
```

## Build Commands

```bash
# Build client and server
npm run build

# Build client only
npm run build:client

# Build server only
npm run build:server

# Type check
npm run check
```

## Monitoring & Logs

### Railway
- View logs in Railway dashboard
- Logs automatically captured

### Check Application Health
```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Bloom server is running",
  "environment": "production"
}
```

## Performance Optimization

### Database
- Indexes already configured in schema
- Connection pooling enabled via `pg` package

### Frontend
- Vite build optimization
- React Query caching (5 min stale time)
- Lazy loading (can be enhanced)

### Recommended
- Add CDN for static assets (Cloudflare)
- Enable gzip compression (nginx/Railway auto-enables)
- Monitor with Sentry (optional)

## Troubleshooting

### "DATABASE_URL is not set"
- Check environment variables in Railway/Render dashboard
- Ensure PostgreSQL addon is connected

### "CORS error"
- Update `CORS_ORIGIN` environment variable
- Should match your frontend URL

### "Voice recording not working"
- Web Speech API only works on HTTPS in production
- Ensure Railway/Vercel provides HTTPS (default)
- Only works in Chrome/Edge browsers

### "Session not persisting"
- Check `SESSION_SECRET` is set
- Ensure cookies are enabled
- Check `connect-pg-simple` created `session` table

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] SQL injection prevented (Drizzle ORM parameterized queries)
- [x] XSS prevented (React escapes by default)
- [x] CSRF tokens not needed (session-based auth with SameSite cookies)
- [x] HTTPS enforced in production
- [x] Environment secrets not committed to git
- [x] Rate limiting (add in Phase 6 if needed)

## Backup Strategy

### Database Backups
Railway automatically backs up PostgreSQL daily.

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Next Steps (Future Enhancements)

1. **Advanced Voice Evaluation** - Integrate OpenAI Whisper API
2. **Audio Storage** - Save recordings to S3/R2
3. **More Content** - Add levels 4-10
4. **Adaptive Algorithm** - Generate personalized levels
5. **Social Features** - Share garden with friends
6. **Mobile App** - React Native version
7. **Analytics** - Track learning patterns
8. **Gamification** - Achievements, badges, streaks

## Support

For issues, check:
- GitHub Issues: https://github.com/yourusername/bloom/issues
- Railway Logs: Check deploy logs for errors
- Database Studio: `npm run db:studio` to inspect data

---

Built with ❤️ using TypeScript, React, Express, PostgreSQL, and Drizzle ORM
