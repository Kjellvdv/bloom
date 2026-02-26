import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, desc, asc, sql, count, avg } from 'drizzle-orm';
import type {
  User, NewUser, UpdateUser,
  SkillLevel, NewSkillLevel, UpdateSkillLevel,
  Exercise, NewExercise, UpdateExercise,
  UserProgress, NewUserProgress, UpdateUserProgress,
  ExerciseAttempt, NewExerciseAttempt,
  UserGarden, NewUserGarden, UpdateUserGarden,
  GardenMessage, NewGardenMessage,
  UserStreak, NewUserStreak, UpdateUserStreak,
} from '../shared/schema';
import {
  users, skillLevels, exercises, userProgress, exerciseAttempts,
  userGarden, gardenMessages, userStreaks,
} from '../shared/schema';

// Extended types for queries with joins
export interface LevelWithProgress extends SkillLevel {
  progress?: UserProgress | null;
  exerciseCount?: number;
}

export interface ProgressStats {
  totalLevelsCompleted: number;
  totalExercisesCompleted: number;
  averageAccuracy: number;
  totalLearningTime: number; // milliseconds
  skillBreakdown: {
    speaking: { completed: number; accuracy: number };
    listening: { completed: number; accuracy: number };
    spelling: { completed: number; accuracy: number };
  };
  recentActivity: Array<{ date: string; exercisesCompleted: number }>;
}

// ============================================================================
// IStorage Interface
// ============================================================================

export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: NewUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;

  // Skill Levels
  getAllLevels(): Promise<SkillLevel[]>;
  getLevelsWithProgress(userId: number): Promise<LevelWithProgress[]>;
  getLevel(id: number): Promise<SkillLevel | undefined>;
  createSkillLevel(level: NewSkillLevel): Promise<SkillLevel>;
  updateSkillLevel(id: number, updates: UpdateSkillLevel): Promise<SkillLevel | undefined>;

  // Exercises
  getExercisesByLevel(levelId: number): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: NewExercise): Promise<Exercise>;
  updateExercise(id: number, updates: UpdateExercise): Promise<Exercise | undefined>;

  // User Progress
  getUserProgress(userId: number, levelId: number): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: number): Promise<UserProgress[]>;
  createUserProgress(progress: NewUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, updates: UpdateUserProgress): Promise<UserProgress | undefined>;
  getProgressStats(userId: number): Promise<ProgressStats>;

  // Exercise Attempts
  createExerciseAttempt(attempt: NewExerciseAttempt): Promise<ExerciseAttempt>;
  getUserAttempts(userId: number, exerciseId?: number): Promise<ExerciseAttempt[]>;
  getRecentAttempts(userId: number, limit?: number): Promise<ExerciseAttempt[]>;

  // User Garden
  getUserGarden(userId: number): Promise<UserGarden | undefined>;
  createUserGarden(garden: NewUserGarden): Promise<UserGarden>;
  updateUserGarden(userId: number, updates: UpdateUserGarden): Promise<UserGarden | undefined>;

  // Garden Messages
  getUnreadMessages(userId: number): Promise<GardenMessage[]>;
  getAllMessages(userId: number, limit?: number): Promise<GardenMessage[]>;
  createGardenMessage(message: NewGardenMessage): Promise<GardenMessage>;
  markMessageRead(messageId: number): Promise<void>;

  // User Streaks
  getUserStreak(userId: number): Promise<UserStreak | undefined>;
  createUserStreak(streak: NewUserStreak): Promise<UserStreak>;
  updateUserStreak(userId: number, updates: UpdateUserStreak): Promise<UserStreak | undefined>;
}

// ============================================================================
// DbStorage Implementation
// ============================================================================

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = drizzle(pool);
  }

  // ==========================================================================
  // Users
  // ==========================================================================

  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return result[0];
  }

  async createUser(user: NewUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(user)
      .returning();

    return result[0];
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result[0];
  }

  // ==========================================================================
  // Skill Levels
  // ==========================================================================

  async getAllLevels(): Promise<SkillLevel[]> {
    return this.db
      .select()
      .from(skillLevels)
      .where(isNull(skillLevels.deletedAt))
      .orderBy(asc(skillLevels.levelNumber));
  }

  async getLevelsWithProgress(userId: number): Promise<LevelWithProgress[]> {
    // Get all levels
    const levels = await this.getAllLevels();

    // Get user progress for all levels
    const progressRecords = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Get exercise counts per level
    const exerciseCounts = await this.db
      .select({
        levelId: exercises.skillLevelId,
        count: count(),
      })
      .from(exercises)
      .where(isNull(exercises.deletedAt))
      .groupBy(exercises.skillLevelId);

    // Create a map for quick lookup
    const progressMap = new Map(
      progressRecords.map((p) => [p.skillLevelId, p])
    );
    const exerciseCountMap = new Map(
      exerciseCounts.map((c) => [c.levelId, c.count])
    );

    // Combine data
    return levels.map((level) => ({
      ...level,
      progress: progressMap.get(level.id) || null,
      exerciseCount: exerciseCountMap.get(level.id) || 0,
    }));
  }

  async getLevel(id: number): Promise<SkillLevel | undefined> {
    const result = await this.db
      .select()
      .from(skillLevels)
      .where(and(eq(skillLevels.id, id), isNull(skillLevels.deletedAt)))
      .limit(1);

    return result[0];
  }

  async createSkillLevel(level: NewSkillLevel): Promise<SkillLevel> {
    const result = await this.db
      .insert(skillLevels)
      .values(level)
      .returning();

    return result[0];
  }

  async updateSkillLevel(id: number, updates: UpdateSkillLevel): Promise<SkillLevel | undefined> {
    const result = await this.db
      .update(skillLevels)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(skillLevels.id, id))
      .returning();

    return result[0];
  }

  // ==========================================================================
  // Exercises
  // ==========================================================================

  async getExercisesByLevel(levelId: number): Promise<Exercise[]> {
    return this.db
      .select()
      .from(exercises)
      .where(and(eq(exercises.skillLevelId, levelId), isNull(exercises.deletedAt)))
      .orderBy(asc(exercises.orderIndex));
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const result = await this.db
      .select()
      .from(exercises)
      .where(and(eq(exercises.id, id), isNull(exercises.deletedAt)))
      .limit(1);

    return result[0];
  }

  async createExercise(exercise: NewExercise): Promise<Exercise> {
    const result = await this.db
      .insert(exercises)
      .values(exercise)
      .returning();

    return result[0];
  }

  async updateExercise(id: number, updates: UpdateExercise): Promise<Exercise | undefined> {
    const result = await this.db
      .update(exercises)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(exercises.id, id))
      .returning();

    return result[0];
  }

  // ==========================================================================
  // User Progress
  // ==========================================================================

  async getUserProgress(userId: number, levelId: number): Promise<UserProgress | undefined> {
    const result = await this.db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.skillLevelId, levelId)))
      .limit(1);

    return result[0];
  }

  async getAllUserProgress(userId: number): Promise<UserProgress[]> {
    return this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.updatedAt));
  }

  async createUserProgress(progress: NewUserProgress): Promise<UserProgress> {
    const result = await this.db
      .insert(userProgress)
      .values(progress)
      .returning();

    return result[0];
  }

  async updateUserProgress(id: number, updates: UpdateUserProgress): Promise<UserProgress | undefined> {
    const result = await this.db
      .update(userProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProgress.id, id))
      .returning();

    return result[0];
  }

  async getProgressStats(userId: number): Promise<ProgressStats> {
    // Total levels completed
    const completedLevelsResult = await this.db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'completed')));

    const totalLevelsCompleted = completedLevelsResult[0]?.count || 0;

    // Total exercises completed and average accuracy
    const attemptsResult = await this.db
      .select({
        count: count(),
        avgAccuracy: avg(exerciseAttempts.accuracyScore),
        totalDuration: sql<number>`SUM(${exerciseAttempts.attemptDuration})`,
      })
      .from(exerciseAttempts)
      .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.isCorrect, true)));

    const totalExercisesCompleted = attemptsResult[0]?.count || 0;
    const averageAccuracy = Number(attemptsResult[0]?.avgAccuracy) || 0;
    const totalLearningTime = attemptsResult[0]?.totalDuration || 0;

    // Skill breakdown (speaking, listening, spelling)
    const skillBreakdownResult = await this.db
      .select({
        skillType: exercises.exerciseType,
        count: count(),
        avgAccuracy: avg(exerciseAttempts.accuracyScore),
      })
      .from(exerciseAttempts)
      .innerJoin(exercises, eq(exerciseAttempts.exerciseId, exercises.id))
      .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.isCorrect, true)))
      .groupBy(exercises.exerciseType);

    // Map exercise types to skill categories
    const skillBreakdown = {
      speaking: { completed: 0, accuracy: 0 },
      listening: { completed: 0, accuracy: 0 },
      spelling: { completed: 0, accuracy: 0 },
    };

    for (const row of skillBreakdownResult) {
      const skillType = row.skillType;
      const completed = row.count;
      const accuracy = Number(row.avgAccuracy) || 0;

      if (skillType === 'voice_repeat' || skillType === 'voice_answer') {
        skillBreakdown.speaking.completed += completed;
        skillBreakdown.speaking.accuracy = accuracy; // Simplified: use last value
      } else if (skillType === 'listening_comprehension') {
        skillBreakdown.listening.completed += completed;
        skillBreakdown.listening.accuracy = accuracy;
      } else if (skillType === 'spelling') {
        skillBreakdown.spelling.completed += completed;
        skillBreakdown.spelling.accuracy = accuracy;
      }
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivityResult = await this.db
      .select({
        date: sql<string>`DATE(${exerciseAttempts.createdAt})`,
        count: count(),
      })
      .from(exerciseAttempts)
      .where(
        and(
          eq(exerciseAttempts.userId, userId),
          sql`${exerciseAttempts.createdAt} >= ${sevenDaysAgo}`
        )
      )
      .groupBy(sql`DATE(${exerciseAttempts.createdAt})`)
      .orderBy(sql`DATE(${exerciseAttempts.createdAt})`);

    const recentActivity = recentActivityResult.map((row) => ({
      date: row.date,
      exercisesCompleted: row.count,
    }));

    return {
      totalLevelsCompleted,
      totalExercisesCompleted,
      averageAccuracy,
      totalLearningTime,
      skillBreakdown,
      recentActivity,
    };
  }

  // ==========================================================================
  // Exercise Attempts
  // ==========================================================================

  async createExerciseAttempt(attempt: NewExerciseAttempt): Promise<ExerciseAttempt> {
    const result = await this.db
      .insert(exerciseAttempts)
      .values(attempt)
      .returning();

    return result[0];
  }

  async getUserAttempts(userId: number, exerciseId?: number): Promise<ExerciseAttempt[]> {
    if (exerciseId) {
      return this.db
        .select()
        .from(exerciseAttempts)
        .where(and(eq(exerciseAttempts.userId, userId), eq(exerciseAttempts.exerciseId, exerciseId)))
        .orderBy(desc(exerciseAttempts.createdAt));
    }

    return this.db
      .select()
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, userId))
      .orderBy(desc(exerciseAttempts.createdAt));
  }

  async getRecentAttempts(userId: number, limit: number = 10): Promise<ExerciseAttempt[]> {
    return this.db
      .select()
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, userId))
      .orderBy(desc(exerciseAttempts.createdAt))
      .limit(limit);
  }

  // ==========================================================================
  // User Garden
  // ==========================================================================

  async getUserGarden(userId: number): Promise<UserGarden | undefined> {
    const result = await this.db
      .select()
      .from(userGarden)
      .where(eq(userGarden.userId, userId))
      .limit(1);

    return result[0];
  }

  async createUserGarden(garden: NewUserGarden): Promise<UserGarden> {
    const result = await this.db
      .insert(userGarden)
      .values(garden)
      .returning();

    return result[0];
  }

  async updateUserGarden(userId: number, updates: UpdateUserGarden): Promise<UserGarden | undefined> {
    const result = await this.db
      .update(userGarden)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userGarden.userId, userId))
      .returning();

    return result[0];
  }

  // ==========================================================================
  // Garden Messages
  // ==========================================================================

  async getUnreadMessages(userId: number): Promise<GardenMessage[]> {
    return this.db
      .select()
      .from(gardenMessages)
      .where(and(eq(gardenMessages.userId, userId), eq(gardenMessages.isRead, false)))
      .orderBy(desc(gardenMessages.createdAt))
      .limit(10);
  }

  async getAllMessages(userId: number, limit: number = 50): Promise<GardenMessage[]> {
    return this.db
      .select()
      .from(gardenMessages)
      .where(eq(gardenMessages.userId, userId))
      .orderBy(desc(gardenMessages.createdAt))
      .limit(limit);
  }

  async createGardenMessage(message: NewGardenMessage): Promise<GardenMessage> {
    const result = await this.db
      .insert(gardenMessages)
      .values(message)
      .returning();

    return result[0];
  }

  async markMessageRead(messageId: number): Promise<void> {
    await this.db
      .update(gardenMessages)
      .set({ isRead: true })
      .where(eq(gardenMessages.id, messageId));
  }

  // ==========================================================================
  // User Streaks
  // ==========================================================================

  async getUserStreak(userId: number): Promise<UserStreak | undefined> {
    const result = await this.db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    return result[0];
  }

  async createUserStreak(streak: NewUserStreak): Promise<UserStreak> {
    const result = await this.db
      .insert(userStreaks)
      .values(streak)
      .returning();

    return result[0];
  }

  async updateUserStreak(userId: number, updates: UpdateUserStreak): Promise<UserStreak | undefined> {
    const result = await this.db
      .update(userStreaks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStreaks.userId, userId))
      .returning();

    return result[0];
  }
}

// Export storage instance (will be initialized in server/index.ts)
let storage: IStorage;

export function initStorage(connectionString: string): IStorage {
  storage = new DbStorage(connectionString);
  return storage;
}

export function getStorage(): IStorage {
  if (!storage) {
    throw new Error('Storage not initialized. Call initStorage() first.');
  }
  return storage;
}
