'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, GameConfig, Card, Player, DIFFICULTY_CONFIG, TurnResult } from '@/lib/types';
import { pokemonService } from '@/services/pokemon.service';
import { storageService } from '@/services/storage.service';
import { shuffleArray, calculateScore } from '@/lib/utils';

const TIMER_DURATION = 30; // seconds per turn
const CARD_REVEAL_DURATION = 1000; // ms

export function useGameController() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const comparisonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =============================================================================
  // GAME INITIALIZATION
  // =============================================================================

  const initGame = useCallback(async (config: GameConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate placeholder cards based on difficulty
      const diffConfig = DIFFICULTY_CONFIG[config.difficulty];
      const placeholderCards: Card[] = [];
      let cardId = 0;

      // Create placeholder cards (we'll populate them with Pokemon data later)
      for (let i = 0; i < diffConfig.uniquePokemon; i++) {
        // Create two cards for each Pokemon (a pair)
        for (let j = 0; j < 2; j++) {
          placeholderCards.push({
            id: cardId++,
            pokemonId: 0,
            name: 'Loading...',
            image: '',
            isFlipped: false,
            isMatched: false,
            isLoading: true,
          });
        }
      }

      // Shuffle placeholder cards
      const shuffled = shuffleArray(placeholderCards);

      // Initialize state with loading cards
      const newState: GameState = {
        config,
        cards: shuffled,
        players: config.players.map((player, index) => ({
          ...player,
          score: 0,
          totalFlips: 0,
          matches: 0,
          isActive: index === 0,
        })),
        currentPlayerIndex: 0,
        revealedCards: [],
        timeRemaining: TIMER_DURATION,
        totalPlaytime: 0, // Track total elapsed time for all game types
        isPaused: false,
        isGameOver: false,
        winner: null,
      };

      setGameState(newState);

      // Save initial state
      storageService.saveGame({ config, state: newState });

      // Start timer
      startTimer();

      // Load Pokemon data in background (non-blocking)
      pokemonService.getRandomPokemon(
        config.theme.generation,
        diffConfig.uniquePokemon
      ).then(pokemon => {
        // Update cards with actual Pokemon data
        setGameState(prev => {
          if (!prev) return prev;

          // Create pairs of Pokemon (each Pokemon appears twice)
          const pokemonPairs: typeof pokemon = [];
          pokemon.forEach(poke => {
            pokemonPairs.push(poke);
            pokemonPairs.push(poke);
          });

          // Shuffle the Pokemon pairs to match the shuffled card positions
          const shuffledPokemon = shuffleArray(pokemonPairs);

          // Map shuffled Pokemon to shuffled card positions (one-to-one)
          const updatedCards = prev.cards.map((card, index) => ({
            ...card,
            pokemonId: shuffledPokemon[index].id,
            name: shuffledPokemon[index].name,
            image: shuffledPokemon[index].spriteUrl,
            isLoading: false,
          }));

          const updatedState = {
            ...prev,
            cards: updatedCards,
          };

          // Save updated state
          storageService.saveGame({ config: prev.config, state: updatedState });

          return updatedState;
        });

        // Data loaded, hide loading state
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load Pokemon data');
        setIsLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
      setIsLoading(false);
    }
  }, []);

  // =============================================================================
  // TIMER
  // =============================================================================

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isPaused || prev.isGameOver) return prev;

        const isSoloPlayer = prev.players.length === 1;

        // Always increment total playtime
        const newTotalPlaytime = prev.totalPlaytime + 1;

        // For solo players, just count up totalPlaytime (no countdown)
        if (isSoloPlayer) {
          return {
            ...prev,
            totalPlaytime: newTotalPlaytime,
          };
        }

        // For multiplayer, handle countdown timer
        const newTime = prev.timeRemaining - 1;

        if (newTime <= 0) {
          // Time expired, switch turn
          handleTimerExpired();
          return {
            ...prev,
            totalPlaytime: newTotalPlaytime,
          };
        }

        return {
          ...prev,
          timeRemaining: newTime,
          totalPlaytime: newTotalPlaytime,
        };
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleTimerExpired = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;

      // Switch to next player
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        timeRemaining: TIMER_DURATION,
        revealedCards: [],
        players: prev.players.map((p, idx) => ({
          ...p,
          isActive: idx === nextPlayerIndex,
        })),
      };
    });
  }, []);

  // =============================================================================
  // CARD FLIP
  // =============================================================================

  const flipCard = useCallback((cardId: number): TurnResult => {
    if (!gameState || gameState.isPaused || gameState.isGameOver) {
      return TurnResult.INVALID;
    }

    const card = gameState.cards.find(c => c.id === cardId);

    if (!card || card.isMatched || card.isFlipped || card.isLoading || gameState.revealedCards.length >= 2) {
      return TurnResult.INVALID;
    }

    // Update state to flip the card
    setGameState(prev => {
      if (!prev) return prev;

      const newCards = prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );

      const newRevealedCards = [...prev.revealedCards, card];

      // Update player's total flips
      const newPlayers = prev.players.map((p, idx) =>
        idx === prev.currentPlayerIndex
          ? { ...p, totalFlips: (p.totalFlips || 0) + 1 }
          : p
      );

      const newState = {
        ...prev,
        cards: newCards,
        revealedCards: newRevealedCards,
        players: newPlayers,
      };

      // Save state
      storageService.saveGame({ config: prev.config, state: newState });

      // If two cards are revealed, compare them
      if (newRevealedCards.length === 2) {
        setTimeout(() => compareCards(), CARD_REVEAL_DURATION);
      }

      return newState;
    });

    return TurnResult.FIRST_CARD;
  }, [gameState]);

  // =============================================================================
  // CARD COMPARISON
  // =============================================================================

  const compareCards = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.revealedCards.length !== 2) return prev;

      const [first, second] = prev.revealedCards;
      const isMatch = first.pokemonId === second.pokemonId;

      if (isMatch) {
        // Match found!
        const newCards = prev.cards.map(c =>
          c.id === first.id || c.id === second.id
            ? { ...c, isMatched: true }
            : c
        );

        // Update current player's score and matches
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const newMatches = (currentPlayer.matches || 0) + 1;
        const newScore = calculateScore(newMatches, currentPlayer.totalFlips || 0);

        const newPlayers = prev.players.map((p, idx) =>
          idx === prev.currentPlayerIndex
            ? { ...p, score: newScore, matches: newMatches }
            : p
        );

        // Check if game is over (all cards matched)
        const allMatched = newCards.every(c => c.isMatched);

        if (allMatched) {
          // Game over!
          const winners = findWinners(newPlayers);

          // Save to leaderboard
          newPlayers.forEach(player => {
            storageService.addToLeaderboard({
              playerId: player.id,
              playerName: player.name,
              score: player.score,
              difficulty: prev.config.difficulty,
              totalFlips: player.totalFlips || 0,
              matches: player.matches || 0,
              totalPlaytime: prev.totalPlaytime,
            });
          });

          // Clear saved game
          storageService.clearGame();

          return {
            ...prev,
            cards: newCards,
            players: newPlayers,
            revealedCards: [],
            isGameOver: true,
            winner: winners.length === 1 ? winners[0] : winners,
          };
        }

        return {
          ...prev,
          cards: newCards,
          players: newPlayers,
          revealedCards: [],
          timeRemaining: TIMER_DURATION, // Reset timer on match
        };
      } else {
        // No match - flip cards back
        const newCards = prev.cards.map(c =>
          c.id === first.id || c.id === second.id
            ? { ...c, isFlipped: false }
            : c
        );

        // Switch to next player
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

        const newState = {
          ...prev,
          cards: newCards,
          revealedCards: [],
          currentPlayerIndex: nextPlayerIndex,
          timeRemaining: TIMER_DURATION,
          players: prev.players.map((p, idx) => ({
            ...p,
            isActive: idx === nextPlayerIndex,
          })),
        };

        // Save state
        storageService.saveGame({ config: prev.config, state: newState });

        return newState;
      }
    });
  }, []);

  // =============================================================================
  // UTILITIES
  // =============================================================================

  const findWinners = (players: Player[]): Player[] => {
    const maxScore = Math.max(...players.map(p => p.score));
    return players.filter(p => p.score === maxScore);
  };

  const pauseGame = useCallback(() => {
    stopTimer();
    setGameState(prev => prev ? { ...prev, isPaused: true } : prev);
  }, [stopTimer]);

  const resumeGame = useCallback(() => {
    startTimer();
    setGameState(prev => prev ? { ...prev, isPaused: false } : prev);
  }, [startTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    setGameState(null);
    storageService.clearGame();
  }, [stopTimer]);

  // =============================================================================
  // CLEANUP
  // =============================================================================

  useEffect(() => {
    return () => {
      stopTimer();
      if (comparisonTimeoutRef.current) {
        clearTimeout(comparisonTimeoutRef.current);
      }
    };
  }, [stopTimer]);

  return {
    gameState,
    isLoading,
    error,
    initGame,
    flipCard,
    pauseGame,
    resumeGame,
    resetGame,
  };
}
