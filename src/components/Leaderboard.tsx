'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry, Difficulty } from '@/lib/types';
import { storageService } from '@/services/storage.service';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, [difficulty]);

  const loadEntries = () => {
    const allEntries = storageService.getLeaderboardByDifficulty(difficulty);
    setEntries(allEntries.slice(0, 10)); // Top 10
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>┌─ LEADERBOARD ─┐</h2>
        </div>

        <div className={styles.difficultyTabs}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              className={`${styles.tab} ${difficulty === diff ? styles.active : ''}`}
              onClick={() => setDifficulty(diff)}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.rank}>#</div>
            <div className={styles.name}>PLAYER</div>
            <div className={styles.score}>SCORE</div>
            <div className={styles.stats}>STATS</div>
            <div className={styles.date}>DATE</div>
          </div>

          <div className={styles.tableBody}>
            {entries.length === 0 ? (
              <div className={styles.noEntries}>No scores yet. Be the first!</div>
            ) : (
              entries.map((entry, index) => (
                <div key={entry.id} className={styles.tableRow}>
                  <div className={styles.rank}>
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className={styles.name}>{entry.playerName}</div>
                  <div className={styles.score}>{entry.score}</div>
                  <div className={styles.stats}>
                    {entry.matches}/{entry.totalFlips}
                  </div>
                  <div className={styles.date}>{formatDate(entry.timestamp)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btnClose}>
            ← BACK
          </button>
        </div>

        <div className={styles.modalFooter}>
          <p>└───────────────┘</p>
        </div>
      </div>
    </div>
  );
}
