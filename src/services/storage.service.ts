import { GameState, GameConfig, LeaderboardEntry, Difficulty } from '@/lib/types';

const GAME_STATE_KEY = 'pokememo_game_state';
const LEADERBOARD_KEY = 'pokememo_leaderboard';
const PLAYER_ID_KEY = 'pokememo_player_id';
const DARK_MODE_KEY = 'pokememo_dark_mode';

interface SavedGame {
  config: GameConfig;
  state: GameState;
}

class StorageService {
  /**
   * Check if we're in a browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // =============================================================================
  // GAME STATE
  // =============================================================================

  /**
   * Save current game state
   */
  saveGame(game: SavedGame): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(game));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }

  /**
   * Load saved game state
   */
  loadGame(): SavedGame | null {
    if (!this.isBrowser()) return null;

    try {
      const saved = localStorage.getItem(GAME_STATE_KEY);
      if (!saved) return null;

      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }

  /**
   * Clear saved game
   */
  clearGame(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(GAME_STATE_KEY);
    } catch (error) {
      console.error('Error clearing game:', error);
    }
  }

  // =============================================================================
  // LEADERBOARD
  // =============================================================================

  /**
   * Get all leaderboard entries
   */
  getLeaderboard(): LeaderboardEntry[] {
    if (!this.isBrowser()) return [];

    try {
      const saved = localStorage.getItem(LEADERBOARD_KEY);
      if (!saved) return [];

      const entries: LeaderboardEntry[] = JSON.parse(saved);

      // Sort by score (descending)
      return entries.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      return [];
    }
  }

  /**
   * Get leaderboard entries by difficulty
   */
  getLeaderboardByDifficulty(difficulty: Difficulty): LeaderboardEntry[] {
    const all = this.getLeaderboard();
    return all.filter(entry => entry.difficulty === difficulty);
  }

  /**
   * Add entry to leaderboard
   */
  addToLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): void {
    if (!this.isBrowser()) return;

    try {
      const entries = this.getLeaderboard();

      const newEntry: LeaderboardEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now(),
      };

      entries.push(newEntry);

      // Keep only top 100 scores per difficulty
      const byDifficulty: Record<Difficulty, LeaderboardEntry[]> = {
        easy: [],
        medium: [],
        hard: [],
      };

      entries.forEach(e => {
        byDifficulty[e.difficulty].push(e);
      });

      const trimmed: LeaderboardEntry[] = [];
      Object.values(byDifficulty).forEach(diffEntries => {
        const sorted = diffEntries.sort((a, b) => b.score - a.score);
        trimmed.push(...sorted.slice(0, 100));
      });

      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error adding to leaderboard:', error);
    }
  }

  /**
   * Clear leaderboard
   */
  clearLeaderboard(): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(LEADERBOARD_KEY);
    } catch (error) {
      console.error('Error clearing leaderboard:', error);
    }
  }

  // =============================================================================
  // PLAYER ID
  // =============================================================================

  /**
   * Get or create player ID
   */
  getPlayerId(): string {
    if (!this.isBrowser()) return this.generateId();

    try {
      let playerId = localStorage.getItem(PLAYER_ID_KEY);

      if (!playerId) {
        playerId = this.generateId();
        localStorage.setItem(PLAYER_ID_KEY, playerId);
      }

      return playerId;
    } catch (error) {
      console.error('Error getting player ID:', error);
      return this.generateId();
    }
  }

  // =============================================================================
  // DARK MODE
  // =============================================================================

  /**
   * Get dark mode preference
   */
  getDarkMode(): boolean {
    if (!this.isBrowser()) return false;

    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved === null) {
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return saved === 'true';
    } catch (error) {
      console.error('Error getting dark mode:', error);
      return false;
    }
  }

  /**
   * Set dark mode preference
   */
  setDarkMode(isDark: boolean): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.setItem(DARK_MODE_KEY, isDark.toString());
    } catch (error) {
      console.error('Error setting dark mode:', error);
    }
  }

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storageService = new StorageService();
