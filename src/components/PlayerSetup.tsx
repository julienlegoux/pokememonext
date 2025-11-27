'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';
import { storageService } from '@/services/storage.service';
import { getPlayerColor } from '@/lib/constants';
import { Modal } from './Modal';
import styles from './Modal.module.css';

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
}

export function PlayerSetup({ onComplete }: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['Player 1']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const names = Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
    setPlayerNames(names);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const players: Player[] = playerNames.map((name, index) => ({
      id: `${storageService.getPlayerId()}-${index}`,
      name: name || `Player ${index + 1}`,
      score: 0,
      isActive: index === 0,
      color: getPlayerColor(index),
      totalFlips: 0,
      matches: 0,
    }));

    onComplete(players);
  };

  return (
    <Modal title="PLAYER SETUP">
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Number of Players:</label>
          <div className={styles.buttonGroup}>
            {[1, 2, 3, 4].map(count => (
              <button
                key={count}
                type="button"
                className={`${styles.btn} ${playerCount === count ? styles.active : ''}`}
                onClick={() => handlePlayerCountChange(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {playerNames.map((name, index) => (
          <div key={index} className={styles.formGroup}>
            <label style={{ color: getPlayerColor(index) }}>
              Player {index + 1} Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(index, e.target.value)}
              className={styles.input}
              style={{ borderColor: getPlayerColor(index) }}
              maxLength={20}
            />
          </div>
        ))}

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          ► START GAME
        </button>
      </form>
    </Modal>
  );
}
