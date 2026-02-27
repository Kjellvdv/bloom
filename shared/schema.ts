import { pgTable, serial, text, integer, boolean, timestamp, real, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================================================
// Users Table
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),

  // Language preferences
  nativeLanguage: text('native_language').notNull().default('es'), // "es" for Spanish
  targetLanguage: text('target_language').notNull().default('en'), // "en" for English

  // Profile
  profileImage: text('profile_image'),

  // Reminder settings
  reminderEnabled: boolean('reminder_enabled').notNull().default(true),
  reminderTime: text('reminder_time'), // e.g., "18:00" for 6pm

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Zod schemas for users
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Email inválido'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  passwordHash: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nativeLanguage: z.enum(['es', 'en']).default('es'),
  targetLanguage: z.enum(['es', 'en']).default('en'),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});

export const updateUserSchema = insertUserSchema.partial();

// Safe user schema (without password)
export const safeUserSchema = createSelectSchema(users).omit({
  passwordHash: true,
  deletedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SafeUser = z.infer<typeof safeUserSchema>;

// ============================================================================
// Skill Levels Table
// ============================================================================

export const skillLevels = pgTable('skill_levels', {
  id: serial('id').primaryKey(),
  levelNumber: integer('level_number').notNull(),

  // Titles and descriptions (bilingual)
  title: text('title').notNull(),
  titleEs: text('title_es').notNull(),
  description: text('description').notNull(),
  descriptionEs: text('description_es').notNull(),

  // Skill focus
  skillType: text('skill_type').notNull(), // "speaking", "listening", "spelling", "mixed"
  difficulty: text('difficulty').notNull(), // "beginner", "elementary", "intermediate"

  // Prerequisites
  prerequisiteLevelId: integer('prerequisite_level_id').references((): any => skillLevels.id),

  // Rewards (what unlocks when level completes)
  rewardFlowerType: text('reward_flower_type'), // "daisy", "rose", "tulip", "sunflower"
  rewardToolType: text('reward_tool_type'), // "watering_can", "pruning_shears", etc.

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const insertSkillLevelSchema = createInsertSchema(skillLevels, {
  levelNumber: z.number().int().positive(),
  skillType: z.enum(['speaking', 'listening', 'spelling', 'mixed']),
  difficulty: z.enum(['beginner', 'elementary', 'intermediate']),
  rewardFlowerType: z.enum(['daisy', 'rose', 'tulip', 'sunflower', 'lily', 'orchid']).optional(),
  rewardToolType: z.enum(['watering_can', 'pruning_shears', 'fertilizer', 'trowel']).optional(),
});

export const updateSkillLevelSchema = insertSkillLevelSchema.partial();

export type SkillLevel = typeof skillLevels.$inferSelect;
export type NewSkillLevel = z.infer<typeof insertSkillLevelSchema>;
export type UpdateSkillLevel = z.infer<typeof updateSkillLevelSchema>;

// ============================================================================
// Exercises Table
// ============================================================================

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  skillLevelId: integer('skill_level_id')
    .notNull()
    .references(() => skillLevels.id),

  orderIndex: integer('order_index').notNull(), // Position within level (0-indexed)

  // Exercise type
  exerciseType: text('exercise_type').notNull(),
  // "voice_repeat" - repeat what you hear
  // "voice_answer" - answer a question
  // "spelling" - type the correct spelling
  // "listening_comprehension" - listen and choose answer

  // Content (bilingual)
  promptText: text('prompt_text').notNull(), // English prompt
  promptTextEs: text('prompt_text_es').notNull(), // Spanish translation
  promptAudioUrl: text('prompt_audio_url'), // URL to audio file

  // Expected response
  expectedText: text('expected_text'), // For voice/spelling exercises
  correctAnswers: jsonb('correct_answers').$type<string[]>(), // Multiple valid answers

  // Hints and feedback
  hintText: text('hint_text'),
  hintTextEs: text('hint_text_es'),
  successMessageEs: text('success_message_es'),

  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const insertExerciseSchema = createInsertSchema(exercises, {
  skillLevelId: z.number().int().positive(),
  orderIndex: z.number().int().nonnegative(),
  exerciseType: z.enum(['voice_repeat', 'voice_answer', 'spelling', 'listening_comprehension', 'translation']),
  promptText: z.string().min(1),
  promptTextEs: z.string().min(1),
  correctAnswers: z.array(z.string()).optional(),
});

export const updateExerciseSchema = insertExerciseSchema.partial();

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = z.infer<typeof insertExerciseSchema>;
export type UpdateExercise = z.infer<typeof updateExerciseSchema>;

// ============================================================================
// User Progress Table
// ============================================================================

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  skillLevelId: integer('skill_level_id')
    .notNull()
    .references(() => skillLevels.id),

  // Progress state
  status: text('status').notNull().default('locked'), // "locked", "in_progress", "completed"
  currentExerciseIndex: integer('current_exercise_index').notNull().default(0),
  completionPercentage: integer('completion_percentage').notNull().default(0), // 0-100

  // Performance metrics
  totalAttempts: integer('total_attempts').notNull().default(0),
  correctAttempts: integer('correct_attempts').notNull().default(0),
  averageAccuracy: real('average_accuracy').notNull().default(0), // 0-100

  // Timestamps
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  lastAccessedAt: timestamp('last_accessed_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress, {
  userId: z.number().int().positive(),
  skillLevelId: z.number().int().positive(),
  status: z.enum(['locked', 'in_progress', 'completed']).default('locked'),
  currentExerciseIndex: z.number().int().nonnegative().default(0),
  completionPercentage: z.number().int().min(0).max(100).default(0),
  totalAttempts: z.number().int().nonnegative().default(0),
  correctAttempts: z.number().int().nonnegative().default(0),
  averageAccuracy: z.number().min(0).max(100).default(0),
});

export const updateUserProgressSchema = insertUserProgressSchema.partial();

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UpdateUserProgress = z.infer<typeof updateUserProgressSchema>;

// ============================================================================
// Exercise Attempts Table
// ============================================================================

export const exerciseAttempts = pgTable('exercise_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id),

  // Attempt data
  userResponse: text('user_response'), // Text transcription or typed answer
  audioRecordingUrl: text('audio_recording_url'), // URL to voice recording (if applicable)

  // Scoring
  isCorrect: boolean('is_correct').notNull(),
  accuracyScore: real('accuracy_score'), // 0-100, for voice exercises

  // Metadata
  attemptDuration: integer('attempt_duration'), // milliseconds
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertExerciseAttemptSchema = createInsertSchema(exerciseAttempts, {
  userId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  userResponse: z.string().optional(),
  audioRecordingUrl: z.string().url().optional(),
  isCorrect: z.boolean(),
  accuracyScore: z.number().min(0).max(100).optional(),
  attemptDuration: z.number().int().positive().optional(),
});

export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;
export type NewExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;

// ============================================================================
// User Garden Table
// ============================================================================

// Type for plant positions in the garden
export interface PlantPosition {
  id: string;
  flowerType: string; // "daisy", "rose", etc.
  x: number; // Percentage position (0-100)
  y: number; // Percentage position (0-100)
  size: 'small' | 'medium' | 'large';
  unlocked: boolean;
  bloomedAt: string | null; // ISO timestamp
}

export const userGarden = pgTable('user_garden', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),

  // Garden theme
  gardenTheme: text('garden_theme').notNull().default('spring'), // "spring", "summer", "autumn", "winter"

  // Growth metrics
  totalFlowers: integer('total_flowers').notNull().default(0),
  totalWateringSessions: integer('total_watering_sessions').notNull().default(0),
  gardenLevel: integer('garden_level').notNull().default(1),

  // Visual state (stored as JSON)
  plantPositions: jsonb('plant_positions').$type<PlantPosition[]>().default([]),
  unlockedTools: jsonb('unlocked_tools').$type<string[]>().default([]),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertUserGardenSchema = createInsertSchema(userGarden, {
  userId: z.number().int().positive(),
  gardenTheme: z.enum(['spring', 'summer', 'autumn', 'winter']).default('spring'),
  totalFlowers: z.number().int().nonnegative().default(0),
  totalWateringSessions: z.number().int().nonnegative().default(0),
  gardenLevel: z.number().int().positive().default(1),
  plantPositions: z.array(z.object({
    id: z.string(),
    flowerType: z.string(),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    size: z.enum(['small', 'medium', 'large']),
    unlocked: z.boolean(),
    bloomedAt: z.string().nullable(),
  })).default([]),
  unlockedTools: z.array(z.string()).default([]),
});

export const updateUserGardenSchema = insertUserGardenSchema.partial().omit({ userId: true });

export type UserGarden = typeof userGarden.$inferSelect;
export type NewUserGarden = z.infer<typeof insertUserGardenSchema>;
export type UpdateUserGarden = z.infer<typeof updateUserGardenSchema>;

// ============================================================================
// Garden Messages Table
// ============================================================================

export const gardenMessages = pgTable('garden_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  messageType: text('message_type').notNull(), // "encouragement", "milestone", "welcome"
  messageTextEs: text('message_text_es').notNull(), // Spanish message

  triggerCondition: text('trigger_condition'), // "level_complete", "3_day_streak", etc.

  isRead: boolean('is_read').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const insertGardenMessageSchema = createInsertSchema(gardenMessages, {
  userId: z.number().int().positive(),
  messageType: z.enum(['encouragement', 'milestone', 'welcome']),
  messageTextEs: z.string().min(1),
  triggerCondition: z.string().optional(),
  isRead: z.boolean().default(false),
});

export type GardenMessage = typeof gardenMessages.$inferSelect;
export type NewGardenMessage = z.infer<typeof insertGardenMessageSchema>;

// ============================================================================
// User Streaks Table
// ============================================================================

export const userStreaks = pgTable('user_streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),

  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),

  lastSessionDate: timestamp('last_session_date'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertUserStreakSchema = createInsertSchema(userStreaks, {
  userId: z.number().int().positive(),
  currentStreak: z.number().int().nonnegative().default(0),
  longestStreak: z.number().int().nonnegative().default(0),
});

export const updateUserStreakSchema = insertUserStreakSchema.partial().omit({ userId: true });

export type UserStreak = typeof userStreaks.$inferSelect;
export type NewUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UpdateUserStreak = z.infer<typeof updateUserStreakSchema>;
