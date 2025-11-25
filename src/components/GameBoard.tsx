'use client';

import { Card, DIFFICULTY_CONFIG, Difficulty } from '@/lib/types';
import { PokemonCard } from './PokemonCard';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  cards: Card[];
  difficulty: Difficulty;
  onCardFlip: (cardId: number) => void;
  disabled?: boolean;
}

export function GameBoard({ cards, difficulty, onCardFlip, disabled }: GameBoardProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
      }}
    >
      {cards.map(card => (
        <PokemonCard key={card.id} card={card} onFlip={onCardFlip} disabled={disabled} />
      ))}
    </div>
  );
}
