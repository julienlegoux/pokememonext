'use client';

import { Player } from '@/lib/types';
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  players: Player[];
  currentPlayerIndex: number;
}

export function ScoreDisplay({ players, currentPlayerIndex }: ScoreDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>┌─ SCORES ─┐</div>
      <div className={styles.scores}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`${styles.player} ${index === currentPlayerIndex ? styles.active : ''}`}
            style={{
              borderColor: index === currentPlayerIndex ? player.color : undefined,
              boxShadow: index === currentPlayerIndex ? `0 0 10px ${player.color}` : undefined,
            }}
          >
            <div
              className={styles.playerName}
              style={{ color: player.color }}
            >
              {index === currentPlayerIndex ? '► ' : '  '}
              {player.name}
            </div>
            <div
              className={styles.playerScore}
              style={{ color: player.color }}
            >
              {player.score}
            </div>
            <div className={styles.playerStats}>
              Matches: {player.matches || 0} | Flips: {player.totalFlips || 0}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footer}>└──────────┘</div>
    </div>
  );
}
