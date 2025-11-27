"use client";

import { useState, useEffect } from "react";
import { GameConfig, Player, Difficulty, PokemonGeneration } from "@/lib/types";
import { useGameController } from "@/hooks/useGameController";
import { storageService } from "@/services/storage.service";

import { PlayerSetup } from "@/components/PlayerSetup";
import { DifficultySelector } from "@/components/DifficultySelector";
import { GameBoard } from "@/components/GameBoard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { TimerDisplay } from "@/components/TimerDisplay";
import { Leaderboard } from "@/components/Leaderboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import styles from "./page.module.css";

type GamePhase = "setup" | "difficulty" | "playing" | "leaderboard";

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const { gameState, isLoading, error, initGame, flipCard, resetGame } =
    useGameController();

  // Load dark mode preference
  useEffect(() => {
    const isDark = storageService.getDarkMode();
    setDarkMode(isDark);
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, []);

  // Handle player setup completion
  const handlePlayersConfigured = (configuredPlayers: Player[]) => {
    setPlayers(configuredPlayers);
    setPhase("difficulty");
  };

  // Handle difficulty selection
  const handleDifficultySelected = async (
    difficulty: Difficulty,
    generation: PokemonGeneration
  ) => {
    const config: GameConfig = {
      difficulty,
      players,
      theme: { generation },
    };

    await initGame(config);
    setPhase("playing");
  };

  // Handle new game
  const handleNewGame = () => {
    if (confirm("Start a new game? Current progress will be lost.")) {
      resetGame();
      setPhase("setup");
    }
  };

  // Handle view leaderboard
  const handleViewLeaderboard = () => {
    setPhase("leaderboard");
  };

  // Handle close leaderboard
  const handleCloseLeaderboard = () => {
    if (gameState) {
      setPhase("playing");
    } else {
      setPhase("setup");
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    storageService.setDarkMode(newDarkMode);
    document.documentElement.setAttribute(
      "data-theme",
      newDarkMode ? "dark" : "light"
    );
  };

  // Handle card flip
  const handleCardFlip = (cardId: number) => {
    if (gameState && !gameState.isPaused) {
      flipCard(cardId);
    }
  };

  // Show game over message
  useEffect(() => {
    if (gameState?.isGameOver) {
      const winners = Array.isArray(gameState.winner)
        ? gameState.winner
        : gameState.winner
        ? [gameState.winner]
        : [];

      const message =
        winners.length > 1
          ? `🎉 Tie game! Winners: ${winners.map((w) => w.name).join(", ")}`
          : winners.length === 1
          ? `🎉 ${winners[0].name} wins!`
          : "Game Over!";

      setTimeout(() => {
        alert(message);
        setPhase("leaderboard");
      }, 500);
    }
  }, [gameState?.isGameOver]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          ┌──────────────────┐
          <br />│ 🎮 POKEMEMO 🎮 │<br />
          └──────────────────┘
        </h1>
        <button
          onClick={handleDarkModeToggle}
          className={styles.darkModeBtn}
          title="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      <main className={styles.main}>
        <ErrorBoundary>
          {phase === "setup" && (
            <PlayerSetup onComplete={handlePlayersConfigured} />
          )}

          {phase === "difficulty" && (
            <DifficultySelector onSelect={handleDifficultySelected} />
          )}

          {phase === "playing" && gameState && (
            <div className={styles.gameContainer}>
              <div className={styles.gameHeader}>
                <TimerDisplay
                  timeRemaining={gameState.timeRemaining}
                  totalPlaytime={gameState.totalPlaytime}
                  isSoloPlayer={gameState.players.length === 1}
                />
                <div className={styles.gameActions}>
                  <button onClick={handleNewGame} className={styles.btn}>
                    🔄 NEW GAME
                  </button>
                  <button
                    onClick={handleViewLeaderboard}
                    className={styles.btn}
                  >
                    🏆 LEADERBOARD
                  </button>
                </div>
              </div>

              <div className={styles.gameContent}>
                <div className={styles.boardContainer}>
                  <GameBoard
                    cards={gameState.cards}
                    difficulty={gameState.config.difficulty}
                    onCardFlip={handleCardFlip}
                    disabled={gameState.isPaused || gameState.isGameOver}
                  />
                </div>

                <div className={styles.sidebar}>
                  <ScoreDisplay
                    players={gameState.players}
                    currentPlayerIndex={gameState.currentPlayerIndex}
                  />
                </div>
              </div>
            </div>
          )}

          {phase === "leaderboard" && (
            <Leaderboard onClose={handleCloseLeaderboard} />
          )}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.loadingText}>Loading Pokemon...</div>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <div className={styles.errorText}>Error: {error}</div>
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <p>Built with React, Next.js, and PokeAPI | Open Source Memory Game</p>
      </footer>
    </div>
  );
}
