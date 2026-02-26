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
