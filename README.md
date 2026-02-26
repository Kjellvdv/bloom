# 🌱 Bloom - Grow Your English, One Petal at a Time

A whimsical, garden-themed English learning app for Spanish speakers where every word learned is a seed planted and every skill mastered is a flower blooming.

## Features

- **Garden-Themed Learning**: Watch your virtual garden bloom as you progress
- **Voice-First Practice**: Pronunciation practice with real-time feedback
- **3-5 Minute Sessions**: Short "watering sessions" that fit into busy lives
- **Adaptive Levels**: The app grows with you, generating new levels based on your progress
- **Joyful Experience**: No leaderboards, no pressure - just personal growth

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Radix UI, React Spring
- **Backend**: Express, TypeScript, Passport (session auth)
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **State Management**: React Query + Context API
- **Voice**: Web Speech API + OpenAI Whisper

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up the database:
   ```bash
   npm run db:push
   npm run seed
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Development Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:client` - Start only the frontend dev server
- `npm run dev:server` - Start only the backend dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check the entire codebase
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run seed` - Seed initial content (3 levels with exercises)

## Project Structure

```
bloom/
├── client/              # React frontend
│   └── src/
│       ├── pages/      # Dashboard, Exercise, Progress, Settings
│       ├── components/ # Garden, VoiceRecorder, ExerciseSession
│       ├── context/    # AuthContext
│       ├── hooks/      # useLevels, useProgress, useGarden
│       └── lib/        # API client, voice utilities
├── server/             # Express backend
│   ├── index.ts       # Server entry point
│   ├── routes/        # API route handlers
│   ├── storage.ts     # Data access layer
│   ├── utils/         # Utility functions
│   └── seeds/         # Database seed scripts
└── shared/             # Shared types and schemas
    └── schema.ts      # Drizzle tables + Zod validation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Levels & Exercises
- `GET /api/levels` - Get all levels with progress
- `GET /api/levels/:id` - Get single level
- `GET /api/levels/:id/exercises` - Get exercises for level
- `POST /api/exercises/:id/attempt` - Submit exercise attempt

### Progress & Garden
- `GET /api/progress` - Get overall progress
- `GET /api/progress/stats` - Get learning statistics
- `GET /api/garden` - Get garden state
- `PUT /api/garden` - Update garden

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

Private - All rights reserved
