import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { skillLevels, exercises } from '../../shared/schema';

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
    ],
  },
];

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
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
    console.log(`   - 41 exercises total (12 + 14 + 15)`);
    console.log(`   - Level 1: Greetings & Introductions (speaking)`);
    console.log(`   - Level 2: Daily Conversations (mixed)`);
    console.log(`   - Level 3: Spelling & Writing (spelling)`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seed };
