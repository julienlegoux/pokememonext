export interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  color: string;
  totalFlips?: number;
  matches?: number;
}

export interface Card {
  id: number;
  pokemonId: number;
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type PlayerList = Player[];
export type CardList = Card[];

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Leaderboard entry
export interface LeaderboardEntry {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  difficulty: Difficulty;
  timestamp: number;
  totalFlips: number;
  matches: number;
  totalPlaytime?: number; // Total game duration in seconds
}

// Pokemon types
export type PokemonGeneration = 1 | 2 | 3;

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
}

export interface PokemonTheme {
  generation: PokemonGeneration;
}

// Game configuration
export interface GameConfig {
  difficulty: Difficulty;
  players: Player[];
  theme: PokemonTheme;
}

// Card pair
export interface CardPair {
  first: Card;
  second: Card;
}

// Game state
export interface GameState {
  config: GameConfig;
  cards: Card[];
  players: Player[];
  currentPlayerIndex: number;
  revealedCards: Card[];
  timeRemaining: number;
  totalPlaytime: number; // Total elapsed time in seconds (for all game types)
  isPaused: boolean;
  isGameOver: boolean;
  winner: Player | Player[] | null;
}

// Turn result
export enum TurnResult {
  FIRST_CARD = 'first_card',
  MATCH = 'match',
  MISMATCH = 'mismatch',
  INVALID = 'invalid',
  GAME_OVER = 'game_over'
}

// Grid dimensions
export interface GridDimensions {
  rows: number;
  cols: number;
  totalCards: number;
  uniquePokemon: number;
}

// Difficulty configurations
export const DIFFICULTY_CONFIG: Record<Difficulty, GridDimensions> = {
  easy: {
    rows: 2,
    cols: 4,
    totalCards: 8,
    uniquePokemon: 4,
  },
  medium: {
    rows: 4,
    cols: 4,
    totalCards: 16,
    uniquePokemon: 8,
  },
  hard: {
    rows: 4,
    cols: 6,
    totalCards: 24,
    uniquePokemon: 12,
  },
};

// Generation ranges
export const GENERATION_RANGES: Record<PokemonGeneration, { start: number; end: number }> = {
  1: { start: 1, end: 151 },    // Kanto
  2: { start: 152, end: 251 },  // Johto
  3: { start: 252, end: 386 },  // Hoenn
};
