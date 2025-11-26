/**
 * Utility functions for PokeMemo game
 */

/**
 * Fisher-Yates shuffle algorithm
 * Provides truly random, unbiased shuffling in O(n) time
 * @param array - Array to shuffle
 * @returns New shuffled array (does not mutate original)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sort leaderboard entries by score (descending)
 * @param entries - Array of entries with score property
 * @returns Sorted array
 */
export function sortByScoreDesc<T extends { score: number }>(entries: T[]): T[] {
  return entries.sort((a, b) => b.score - a.score);
}

/**
 * Generate a unique ID using crypto API with fallback
 * @returns Unique identifier string
 */
export function generateUniqueId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate game score with guard against division by zero
 * @param matches - Number of successful matches
 * @param totalFlips - Total number of card flips
 * @returns Calculated score (0 if no flips)
 */
export function calculateScore(matches: number, totalFlips: number): number {
  if (totalFlips === 0) return 0;
  return Math.round((matches / totalFlips) * 1000);
}

/**
 * Preload images to avoid loading delays during gameplay
 * @param imageUrls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export async function preloadImages(imageUrls: string[]): Promise<void> {
  await Promise.all(
    imageUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't block on errors
          img.src = url;
        })
    )
  );
}
