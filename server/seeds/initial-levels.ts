import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { skillLevels, exercises, exerciseAttempts, userProgress } from '../../shared/schema';

// Initialize database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ============================================================================
// Seed Data: 3 Levels with 12-15 Exercises Each
// ============================================================================

const seedData = [
  // ==========================================================================
  // LEVEL 1: Greetings & Introductions (Speaking Focus) - 12 exercises
  // ==========================================================================
  {
    level: {
      levelNumber: 1,
      title: 'Greetings & Introductions',
      titleEs: 'Saludos e Introducciones',
      description: 'Learn basic greetings and how to introduce yourself in English',
      descriptionEs: 'Aprende saludos básicos y cómo presentarte en inglés',
      skillType: 'speaking',
      difficulty: 'beginner',
      prerequisiteLevelId: null,
      rewardFlowerType: 'daisy',
      rewardToolType: null,
    },
    exercises: [
      {
        orderIndex: 0,
        exerciseType: 'voice_repeat',
        promptText: 'Hello',
        promptTextEs: 'Hola',
        expectedText: 'hello',
        hintText: 'A simple greeting',
        hintTextEs: 'Un saludo simple',
        successMessageEs: '¡Perfecto! Este es el saludo más común en inglés.',
      },
      {
        orderIndex: 1,
        exerciseType: 'voice_repeat',
        promptText: 'Good morning',
        promptTextEs: 'Buenos días',
        expectedText: 'good morning',
        hintText: 'Used in the morning',
        hintTextEs: 'Se usa por la mañana',
        successMessageEs: '¡Excelente! Usamos esto hasta el mediodía.',
      },
      {
        orderIndex: 2,
        exerciseType: 'voice_repeat',
        promptText: 'Good afternoon',
        promptTextEs: 'Buenas tardes',
        expectedText: 'good afternoon',
        hintText: 'Used after 12 PM',
        hintTextEs: 'Se usa después de las 12 PM',
        successMessageEs: '¡Muy bien! Perfecto para la tarde.',
      },
      {
        orderIndex: 3,
        exerciseType: 'voice_repeat',
        promptText: 'Good evening',
        promptTextEs: 'Buenas noches (saludo)',
        expectedText: 'good evening',
        hintText: 'Used when evening starts',
        hintTextEs: 'Se usa cuando comienza la noche',
        successMessageEs: '¡Fantástico! Este saludo es más formal.',
      },
      {
        orderIndex: 4,
        exerciseType: 'voice_repeat',
        promptText: 'My name is Sarah',
        promptTextEs: 'Mi nombre es Sarah',
        expectedText: 'my name is sarah',
        hintText: 'How to introduce yourself',
        hintTextEs: 'Cómo presentarte',
        successMessageEs: '¡Genial! Ahora puedes decir tu nombre.',
      },
      {
        orderIndex: 5,
        exerciseType: 'voice_answer',
        promptText: 'What is your name?',
        promptTextEs: '¿Cuál es tu nombre?',
        expectedText: 'my name is',
        hintText: 'Answer with "My name is..."',
        hintTextEs: 'Responde con "My name is..."',
        successMessageEs: '¡Perfecto! Así te presentas en inglés.',
      },
      {
        orderIndex: 6,
        exerciseType: 'voice_repeat',
        promptText: 'Nice to meet you',
        promptTextEs: 'Encantado de conocerte',
        expectedText: 'nice to meet you',
        hintText: 'Polite response when meeting someone',
        hintTextEs: 'Respuesta educada al conocer a alguien',
        successMessageEs: '¡Excelente! Una frase muy útil.',
      },
      {
        orderIndex: 7,
        exerciseType: 'voice_repeat',
        promptText: 'How are you?',
        promptTextEs: '¿Cómo estás?',
        expectedText: 'how are you',
        hintText: 'Asking about someone\'s wellbeing',
        hintTextEs: 'Preguntando sobre el bienestar de alguien',
        successMessageEs: '¡Muy bien! Pregunta común al saludar.',
      },
      {
        orderIndex: 8,
        exerciseType: 'voice_repeat',
        promptText: 'I am fine, thank you',
        promptTextEs: 'Estoy bien, gracias',
        expectedText: 'i am fine thank you',
        hintText: 'Common response to "How are you?"',
        hintTextEs: 'Respuesta común a "How are you?"',
        successMessageEs: '¡Perfecto! Respuesta educada y positiva.',
      },
      {
        orderIndex: 9,
        exerciseType: 'voice_repeat',
        promptText: 'I am from Mexico',
        promptTextEs: 'Soy de México',
        expectedText: 'i am from mexico',
        hintText: 'Telling where you\'re from',
        hintTextEs: 'Diciendo de dónde eres',
        successMessageEs: '¡Excelente! Ahora puedes decir tu origen.',
      },
      {
        orderIndex: 10,
        exerciseType: 'voice_answer',
        promptText: 'Where are you from?',
        promptTextEs: '¿De dónde eres?',
        expectedText: 'i am from',
        hintText: 'Answer with "I am from..."',
        hintTextEs: 'Responde con "I am from..."',
        successMessageEs: '¡Genial! Puedes hablar de tu país.',
      },
      {
        orderIndex: 11,
        exerciseType: 'voice_repeat',
        promptText: 'See you later',
        promptTextEs: 'Hasta luego',
        expectedText: 'see you later',
        hintText: 'Casual goodbye',
        hintTextEs: 'Despedida informal',
        successMessageEs: '¡Perfecto! Una forma amigable de despedirse.',
      },
    ],
  },

  // ==========================================================================
  // LEVEL 2: Daily Conversations (Listening & Speaking Mix) - 14 exercises
  // ==========================================================================
  {
    level: {
      levelNumber: 2,
      title: 'Daily Conversations',
      titleEs: 'Conversaciones Diarias',
      description: 'Practice everyday conversations and common phrases',
      descriptionEs: 'Practica conversaciones cotidianas y frases comunes',
      skillType: 'mixed',
      difficulty: 'beginner',
      prerequisiteLevelId: null, // Will be set after level 1 is created
      rewardFlowerType: 'rose',
      rewardToolType: 'watering_can',
    },
    exercises: [
      {
        orderIndex: 0,
        exerciseType: 'voice_repeat',
        promptText: 'What time is it?',
        promptTextEs: '¿Qué hora es?',
        expectedText: 'what time is it',
        hintText: 'Asking about the time',
        hintTextEs: 'Preguntando la hora',
        successMessageEs: '¡Bien hecho! Pregunta muy útil.',
      },
      {
        orderIndex: 1,
        exerciseType: 'voice_repeat',
        promptText: 'It is three o\'clock',
        promptTextEs: 'Son las tres en punto',
        expectedText: 'it is three o clock',
        hintText: 'Telling the time',
        hintTextEs: 'Diciendo la hora',
        successMessageEs: '¡Perfecto! Ahora sabes decir la hora.',
      },
      {
        orderIndex: 2,
        exerciseType: 'voice_repeat',
        promptText: 'I am hungry',
        promptTextEs: 'Tengo hambre',
        expectedText: 'i am hungry',
        hintText: 'Expressing hunger',
        hintTextEs: 'Expresando hambre',
        successMessageEs: '¡Excelente! Frase muy común.',
      },
      {
        orderIndex: 3,
        exerciseType: 'voice_repeat',
        promptText: 'I am thirsty',
        promptTextEs: 'Tengo sed',
        expectedText: 'i am thirsty',
        hintText: 'Expressing thirst',
        hintTextEs: 'Expresando sed',
        successMessageEs: '¡Muy bien! Otra necesidad básica.',
      },
      {
        orderIndex: 4,
        exerciseType: 'voice_repeat',
        promptText: 'Can I have water, please?',
        promptTextEs: '¿Puedo tener agua, por favor?',
        expectedText: 'can i have water please',
        hintText: 'Polite request',
        hintTextEs: 'Petición educada',
        successMessageEs: '¡Genial! Siempre recuerda decir "please".',
      },
      {
        orderIndex: 5,
        exerciseType: 'voice_repeat',
        promptText: 'Thank you very much',
        promptTextEs: 'Muchas gracias',
        expectedText: 'thank you very much',
        hintText: 'Expressing gratitude',
        hintTextEs: 'Expresando gratitud',
        successMessageEs: '¡Perfecto! La gratitud es universal.',
      },
      {
        orderIndex: 6,
        exerciseType: 'voice_repeat',
        promptText: 'You are welcome',
        promptTextEs: 'De nada',
        expectedText: 'you are welcome',
        hintText: 'Response to thank you',
        hintTextEs: 'Respuesta a gracias',
        successMessageEs: '¡Excelente! Respuesta educada.',
      },
      {
        orderIndex: 7,
        exerciseType: 'voice_repeat',
        promptText: 'Excuse me',
        promptTextEs: 'Disculpe / Perdón',
        expectedText: 'excuse me',
        hintText: 'Getting attention or apologizing',
        hintTextEs: 'Para llamar atención o disculparse',
        successMessageEs: '¡Muy bien! Frase muy educada.',
      },
      {
        orderIndex: 8,
        exerciseType: 'voice_repeat',
        promptText: 'I am sorry',
        promptTextEs: 'Lo siento',
        expectedText: 'i am sorry',
        hintText: 'Apologizing',
        hintTextEs: 'Disculpándose',
        successMessageEs: '¡Perfecto! Importante saber disculparse.',
      },
      {
        orderIndex: 9,
        exerciseType: 'voice_repeat',
        promptText: 'Where is the bathroom?',
        promptTextEs: '¿Dónde está el baño?',
        expectedText: 'where is the bathroom',
        hintText: 'Asking for directions',
        hintTextEs: 'Preguntando por direcciones',
        successMessageEs: '¡Genial! Pregunta muy práctica.',
      },
      {
        orderIndex: 10,
        exerciseType: 'voice_repeat',
        promptText: 'How much does it cost?',
        promptTextEs: '¿Cuánto cuesta?',
        expectedText: 'how much does it cost',
        hintText: 'Asking about price',
        hintTextEs: 'Preguntando por el precio',
        successMessageEs: '¡Excelente! Útil para compras.',
      },
      {
        orderIndex: 11,
        exerciseType: 'voice_repeat',
        promptText: 'I don\'t understand',
        promptTextEs: 'No entiendo',
        expectedText: 'i don t understand',
        hintText: 'When you need clarification',
        hintTextEs: 'Cuando necesitas aclaración',
        successMessageEs: '¡Muy bien! No tengas miedo de decir esto.',
      },
      {
        orderIndex: 12,
        exerciseType: 'voice_repeat',
        promptText: 'Can you help me?',
        promptTextEs: '¿Puedes ayudarme?',
        expectedText: 'can you help me',
        hintText: 'Asking for help',
        hintTextEs: 'Pidiendo ayuda',
        successMessageEs: '¡Perfecto! Siempre está bien pedir ayuda.',
      },
      {
        orderIndex: 13,
        exerciseType: 'voice_repeat',
        promptText: 'Have a nice day',
        promptTextEs: 'Que tengas un buen día',
        expectedText: 'have a nice day',
        hintText: 'Friendly farewell',
        hintTextEs: 'Despedida amistosa',
        successMessageEs: '¡Excelente! Un deseo muy amable.',
      },
    ],
  },

  // ==========================================================================
  // LEVEL 3: Spelling & Writing (Spelling Focus) - 15 exercises
  // ==========================================================================
  {
    level: {
      levelNumber: 3,
      title: 'Spelling & Writing',
      titleEs: 'Ortografía y Escritura',
      description: 'Master spelling of common English words',
      descriptionEs: 'Domina la ortografía de palabras comunes en inglés',
      skillType: 'spelling',
      difficulty: 'beginner',
      prerequisiteLevelId: null, // Will be set after level 2 is created
      rewardFlowerType: 'tulip',
      rewardToolType: null,
    },
    exercises: [
      {
        orderIndex: 0,
        exerciseType: 'spelling',
        promptText: 'Spell: Hello',
        promptTextEs: 'Deletrea: Hola',
        expectedText: 'hello',
        hintText: 'H-E-L-L-O',
        hintTextEs: 'H-E-L-L-O',
        successMessageEs: '¡Correcto! Una palabra fundamental.',
      },
      {
        orderIndex: 1,
        exerciseType: 'spelling',
        promptText: 'Spell: Thank you',
        promptTextEs: 'Deletrea: Gracias',
        expectedText: 'thank you',
        hintText: 'Two words',
        hintTextEs: 'Dos palabras',
        successMessageEs: '¡Perfecto! Dos palabras importantes.',
      },
      {
        orderIndex: 2,
        exerciseType: 'spelling',
        promptText: 'Spell: Water',
        promptTextEs: 'Deletrea: Agua',
        expectedText: 'water',
        hintText: 'W-A-T-E-R',
        hintTextEs: 'W-A-T-E-R',
        successMessageEs: '¡Bien hecho! Palabra esencial.',
      },
      {
        orderIndex: 3,
        exerciseType: 'spelling',
        promptText: 'Spell: Please',
        promptTextEs: 'Deletrea: Por favor',
        expectedText: 'please',
        hintText: 'Sounds like "plee-z"',
        hintTextEs: 'Suena como "pli-is"',
        successMessageEs: '¡Excelente! Siempre sé educado.',
      },
      {
        orderIndex: 4,
        exerciseType: 'spelling',
        promptText: 'Spell: Friend',
        promptTextEs: 'Deletrea: Amigo/a',
        expectedText: 'friend',
        hintText: 'Remember: I before E',
        hintTextEs: 'Recuerda: I antes de E',
        successMessageEs: '¡Muy bien! Palabra complicada.',
      },
      {
        orderIndex: 5,
        exerciseType: 'spelling',
        promptText: 'Spell: Family',
        promptTextEs: 'Deletrea: Familia',
        expectedText: 'family',
        hintText: 'F-A-M-I-L-Y',
        hintTextEs: 'F-A-M-I-L-Y',
        successMessageEs: '¡Perfecto! Tu familia es importante.',
      },
      {
        orderIndex: 6,
        exerciseType: 'spelling',
        promptText: 'Spell: Beautiful',
        promptTextEs: 'Deletrea: Hermoso/a',
        expectedText: 'beautiful',
        hintText: 'Starts with B-E-A-U',
        hintTextEs: 'Comienza con B-E-A-U',
        successMessageEs: '¡Genial! Palabra hermosa y difícil.',
      },
      {
        orderIndex: 7,
        exerciseType: 'spelling',
        promptText: 'Spell: Tomorrow',
        promptTextEs: 'Deletrea: Mañana',
        expectedText: 'tomorrow',
        hintText: 'Two M\'s, two R\'s',
        hintTextEs: 'Dos M, dos R',
        successMessageEs: '¡Excelente! Recuerda las dobles letras.',
      },
      {
        orderIndex: 8,
        exerciseType: 'spelling',
        promptText: 'Spell: Restaurant',
        promptTextEs: 'Deletrea: Restaurante',
        expectedText: 'restaurant',
        hintText: 'Ends with -ant',
        hintTextEs: 'Termina con -ant',
        successMessageEs: '¡Muy bien! Palabra difícil pero útil.',
      },
      {
        orderIndex: 9,
        exerciseType: 'spelling',
        promptText: 'Spell: English',
        promptTextEs: 'Deletrea: Inglés',
        expectedText: 'english',
        hintText: 'The language you\'re learning!',
        hintTextEs: '¡El idioma que estás aprendiendo!',
        successMessageEs: '¡Perfecto! Estás aprendiendo English.',
      },
      {
        orderIndex: 10,
        exerciseType: 'spelling',
        promptText: 'Spell: Spanish',
        promptTextEs: 'Deletrea: Español',
        expectedText: 'spanish',
        hintText: 'Your native language',
        hintTextEs: 'Tu idioma nativo',
        successMessageEs: '¡Bien hecho! Tu idioma nativo.',
      },
      {
        orderIndex: 11,
        exerciseType: 'spelling',
        promptText: 'Spell: Wednesday',
        promptTextEs: 'Deletrea: Miércoles',
        expectedText: 'wednesday',
        hintText: 'Silent D: WED-NES-DAY',
        hintTextEs: 'D silenciosa: WED-NES-DAY',
        successMessageEs: '¡Excelente! El día con la D silenciosa.',
      },
      {
        orderIndex: 12,
        exerciseType: 'spelling',
        promptText: 'Spell: Because',
        promptTextEs: 'Deletrea: Porque',
        expectedText: 'because',
        hintText: 'B-E-C-A-U-S-E',
        hintTextEs: 'B-E-C-A-U-S-E',
        successMessageEs: '¡Perfecto! Palabra muy común.',
      },
      {
        orderIndex: 13,
        exerciseType: 'spelling',
        promptText: 'Spell: Through',
        promptTextEs: 'Deletrea: A través de',
        expectedText: 'through',
        hintText: 'Silent GH: THROUGH',
        hintTextEs: 'GH silencioso: THROUGH',
        successMessageEs: '¡Genial! Palabra complicada con GH.',
      },
      {
        orderIndex: 14,
        exerciseType: 'spelling',
        promptText: 'Spell: Knowledge',
        promptTextEs: 'Deletrea: Conocimiento',
        expectedText: 'knowledge',
        hintText: 'Silent K: KNOW-LEDGE',
        hintTextEs: 'K silenciosa: KNOW-LEDGE',
        successMessageEs: '¡Excelente! ¡Ahora tienes knowledge!',
      },
      {
        orderIndex: 15,
        exerciseType: 'translation',
        promptText: 'Translate to English',
        promptTextEs: 'Buenos días',
        expectedText: 'good morning',
        correctAnswers: ['good morning', 'morning'],
        hintText: 'Common morning greeting',
        hintTextEs: 'Saludo común de la mañana',
        successMessageEs: '¡Perfecto! Una manera educada de saludar.',
      },
      {
        orderIndex: 16,
        exerciseType: 'translation',
        promptText: 'Translate to English',
        promptTextEs: 'Muchas gracias',
        expectedText: 'thank you very much',
        correctAnswers: ['thank you very much', 'thanks a lot', 'many thanks'],
        hintText: 'Expressing gratitude',
        hintTextEs: 'Expresando gratitud',
        successMessageEs: '¡Excelente! Siempre agradece.',
      },
      {
        orderIndex: 17,
        exerciseType: 'translation',
        promptText: 'Translate to English',
        promptTextEs: 'Por favor',
        expectedText: 'please',
        hintText: 'Polite request',
        hintTextEs: 'Petición educada',
        successMessageEs: '¡Muy bien! La cortesía es importante.',
      },
      {
        orderIndex: 18,
        exerciseType: 'translation',
        promptText: 'Translate to English',
        promptTextEs: 'Lo siento',
        expectedText: 'i am sorry',
        correctAnswers: ['i am sorry', 'sorry', 'i\'m sorry'],
        hintText: 'Apologizing',
        hintTextEs: 'Disculparse',
        successMessageEs: '¡Correcto! Pedir disculpas es importante.',
      },
      {
        orderIndex: 19,
        exerciseType: 'translation',
        promptText: 'Translate to English',
        promptTextEs: 'Hasta luego',
        expectedText: 'see you later',
        correctAnswers: ['see you later', 'bye', 'goodbye'],
        hintText: 'Saying goodbye',
        hintTextEs: 'Despedirse',
        successMessageEs: '¡Perfecto! Una despedida amistosa.',
      },
    ],
  },
];

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  const isFresh = process.argv.includes('--fresh');

  console.log('🌱 Starting database seeding...');
  if (isFresh) {
    console.log('🔄 Fresh seed mode: will clear existing data');
  }
  console.log('🔗 DATABASE_URL:', DATABASE_URL ? 'Set' : 'Missing');

  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connected successfully');

    // Tables already created via db:push, skip table creation
    console.log('📊 Tables should already exist from db:push');

    /*
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        native_language TEXT NOT NULL DEFAULT 'es',
        target_language TEXT NOT NULL DEFAULT 'en',
        profile_image TEXT,
        reminder_enabled BOOLEAN NOT NULL DEFAULT true,
        reminder_time TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "skillLevels" (
        id SERIAL PRIMARY KEY,
        level_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        title_es TEXT NOT NULL,
        description TEXT NOT NULL,
        description_es TEXT NOT NULL,
        skill_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        prerequisite_level_id INTEGER REFERENCES "skillLevels"(id),
        reward_flower_type TEXT NOT NULL,
        reward_tool_type TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        skill_level_id INTEGER NOT NULL REFERENCES "skillLevels"(id),
        order_index INTEGER NOT NULL,
        exercise_type TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        prompt_text_es TEXT NOT NULL,
        prompt_audio_url TEXT,
        expected_text TEXT,
        correct_answers JSONB,
        hint_text TEXT,
        hint_text_es TEXT,
        success_message_es TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "userProgress" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        skill_level_id INTEGER NOT NULL REFERENCES "skillLevels"(id),
        status TEXT NOT NULL,
        current_exercise_index INTEGER NOT NULL,
        completion_percentage REAL NOT NULL,
        total_attempts INTEGER NOT NULL,
        correct_attempts INTEGER NOT NULL,
        average_accuracy REAL NOT NULL,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        last_accessed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP,
        UNIQUE(user_id, skill_level_id)
      );

      CREATE TABLE IF NOT EXISTS "exerciseAttempts" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        exercise_id INTEGER NOT NULL REFERENCES exercises(id),
        user_response TEXT NOT NULL,
        audio_recording_url TEXT,
        is_correct BOOLEAN NOT NULL,
        accuracy_score REAL NOT NULL,
        attempt_duration INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "userGarden" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        garden_theme TEXT NOT NULL,
        total_flowers INTEGER NOT NULL,
        total_watering_sessions INTEGER NOT NULL,
        garden_level INTEGER NOT NULL,
        plant_positions JSONB NOT NULL,
        unlocked_tools JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "gardenMessages" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        message_type TEXT NOT NULL,
        message_text_es TEXT NOT NULL,
        trigger_condition TEXT NOT NULL,
        is_read BOOLEAN NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "userStreaks" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
        current_streak INTEGER NOT NULL,
        longest_streak INTEGER NOT NULL,
        last_session_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
    `);
    */

    console.log('✅ Skipping table creation (already exist)');

    // Check if data already exists
    const existingLevels = await db.select().from(skillLevels);

    if (existingLevels.length > 0 && !isFresh) {
      console.log(`\n⚠️  Found ${existingLevels.length} existing levels in database`);
      console.log('To re-seed, you have two options:');
      console.log('1. Run: npm run seed:fresh  (clears all data and re-seeds)');
      console.log('2. Manually delete levels from database');
      console.log('\n❌ Skipping seed to avoid duplicates');
      return;
    }

    // Clear existing data if in fresh mode
    if (isFresh && existingLevels.length > 0) {
      console.log('🗑️  Clearing existing level data...');
      await db.delete(exerciseAttempts);
      await db.delete(exercises);
      await db.delete(userProgress);
      await db.delete(skillLevels);
      console.log('✅ Existing data cleared');
    }

    let previousLevelId: number | undefined = undefined;

    for (const { level, exercises: exerciseData } of seedData) {
      // Set prerequisite to previous level
      if (previousLevelId) {
        (level as any).prerequisiteLevelId = previousLevelId;
      }

      // Create level
      console.log(`\n📚 Creating level ${level.levelNumber}: ${level.title}`);
      const [createdLevel] = await db.insert(skillLevels).values(level).returning();
      console.log(`✅ Level ${createdLevel.id} created`);

      // Create exercises for this level
      console.log(`📝 Creating ${exerciseData.length} exercises...`);
      for (const exercise of exerciseData) {
        const exerciseWithLevelId = {
          ...exercise,
          skillLevelId: createdLevel.id,
        };
        await db.insert(exercises).values(exerciseWithLevelId);
      }
      console.log(`✅ ${exerciseData.length} exercises created`);

      previousLevelId = createdLevel.id;
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - 3 skill levels created`);
    console.log(`   - 46 exercises total (12 + 14 + 20)`);
    console.log(`   - Level 1: Greetings & Introductions (speaking)`);
    console.log(`   - Level 2: Daily Conversations (mixed)`);
    console.log(`   - Level 3: Spelling & Writing (spelling + translation)`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed (always run when this file is executed)
seed()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });

export { seed };
