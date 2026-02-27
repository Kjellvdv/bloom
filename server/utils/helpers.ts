/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a percentage (0-100) representing how similar the strings are
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  // Convert to similarity percentage
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * Calculate Levenshtein distance between two strings
 * (minimum number of single-character edits required to change one word into another)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create a 2D array to store distances
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Generate feedback message in Spanish based on accuracy score
 */
export function generateFeedbackMessage(
  isCorrect: boolean,
  accuracyScore: number,
  customSuccessMessage?: string | null
): string {
  if (isCorrect) {
    // Use custom success message if provided, otherwise generate based on score
    if (customSuccessMessage) {
      return customSuccessMessage;
    }

    if (accuracyScore >= 95) {
      const messages = [
        '¡Perfecto! 🌟',
        '¡Excelente trabajo! ✨',
        '¡Increíble! 🎉',
        '¡Lo hiciste perfectamente! 💯',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (accuracyScore >= 85) {
      const messages = [
        '¡Muy bien! 👍',
        '¡Buen trabajo! 🌱',
        '¡Casi perfecto! 💚',
        '¡Sigue así! ⭐',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      // 80-84% - still correct but with room for improvement
      const messages = [
        '¡Correcto! Sigue practicando. 🌿',
        '¡Bien hecho! Puedes mejorar un poco más. 🌸',
        '¡Lo lograste! Practica para perfeccionar. 💪',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  } else {
    // Incorrect - provide encouraging feedback
    if (accuracyScore >= 60) {
      const messages = [
        'Casi lo tienes. ¡Inténtalo de nuevo! 💪',
        'Estás muy cerca. ¡Una vez más! 🌱',
        'Buen intento. ¡Prueba otra vez! 🌿',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (accuracyScore >= 40) {
      const messages = [
        'Sigue intentando. ¡Puedes hacerlo! 💚',
        'No te rindas. ¡Estás aprendiendo! 🌱',
        'Practica un poco más. ¡Vas bien! ✨',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = [
        'Escucha de nuevo e inténtalo. 👂',
        '¿Necesitas una pista? No te preocupes, todos aprendemos paso a paso. 🌿',
        'Toma tu tiempo. La práctica hace al maestro. 💪',
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }
}

/**
 * Normalize numbers in text for comparison
 * Converts digits to words and vice versa
 */
export function normalizeNumbers(text: string): string {
  const numberWords: { [key: string]: string } = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
    'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90'
  };

  const digitWords: { [key: string]: string } = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
    '10': 'ten', '11': 'eleven', '12': 'twelve', '13': 'thirteen',
    '14': 'fourteen', '15': 'fifteen', '16': 'sixteen', '17': 'seventeen',
    '18': 'eighteen', '19': 'nineteen', '20': 'twenty', '30': 'thirty',
    '40': 'forty', '50': 'fifty', '60': 'sixty', '70': 'seventy',
    '80': 'eighty', '90': 'ninety'
  };

  let normalized = text.toLowerCase();

  // Replace number words with digits
  Object.entries(numberWords).forEach(([word, digit]) => {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  return normalized;
}

/**
 * Compare two texts with number normalization
 * Returns true if they match after normalizing numbers
 */
export function compareWithNumberNormalization(text1: string, text2: string): boolean {
  const norm1 = normalizeNumbers(text1.toLowerCase().trim());
  const norm2 = normalizeNumbers(text2.toLowerCase().trim());
  return norm1 === norm2;
}

/**
 * Check if two strings are phonetically similar
 * (Simple implementation - can be enhanced with phonetic algorithms like Soundex or Metaphone)
 */
export function arePhoneticallyAlmostSimilar(str1: string, str2: string): boolean {
  const s1 = str1.toLowerCase().replace(/[^a-z]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z]/g, '');

  // If exact match
  if (s1 === s2) return true;

  // If very close in length and similarity
  const lengthDiff = Math.abs(s1.length - s2.length);
  if (lengthDiff <= 2) {
    const similarity = calculateSimilarity(s1, s2);
    return similarity >= 75;
  }

  return false;
}
