'use client';

import { useState } from 'react';
import { Difficulty, PokemonGeneration, DIFFICULTY_CONFIG } from '@/lib/types';
import { Modal } from './Modal';
import styles from './Modal.module.css';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty, generation: PokemonGeneration) => void;
}

export function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [generation, setGeneration] = useState<PokemonGeneration>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(difficulty, generation);
  };

  const getDifficultyInfo = (diff: Difficulty) => {
    const config = DIFFICULTY_CONFIG[diff];
    return `${config.rows}×${config.cols} (${config.totalCards} cards)`;
  };

  return (
    <Modal title="GAME SETTINGS">
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Difficulty:</label>
          <div className={styles.radioGroup}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
              <label key={diff} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="difficulty"
                  value={diff}
                  checked={difficulty === diff}
                  onChange={e => setDifficulty(e.target.value as Difficulty)}
                />
                <span className={styles.radioText}>
                  {diff.toUpperCase()} {getDifficultyInfo(diff)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Pokémon Generation:</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="generation"
                value="1"
                checked={generation === 1}
                onChange={() => setGeneration(1)}
              />
              <span className={styles.radioText}>Gen 1 (Kanto)</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="generation"
                value="2"
                checked={generation === 2}
                onChange={() => setGeneration(2)}
              />
              <span className={styles.radioText}>Gen 2 (Johto)</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="generation"
                value="3"
                checked={generation === 3}
                onChange={() => setGeneration(3)}
              />
              <span className={styles.radioText}>Gen 3 (Hoenn)</span>
            </label>
          </div>
        </div>

        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          ► CONTINUE
        </button>
      </form>
    </Modal>
  );
}
