'use client';

import { Card } from '@/lib/types';
import styles from './PokemonCard.module.css';

interface PokemonCardProps {
  card: Card;
  onFlip: (cardId: number) => void;
  disabled?: boolean;
}

export function PokemonCard({ card, onFlip, disabled }: PokemonCardProps) {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onFlip(card.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ''} ${
        card.isMatched ? styles.matched : ''
      }`}
      onClick={handleClick}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.cardBack}>?</div>
        </div>
        <div className={styles.cardBack}>
          {(card.isFlipped || card.isMatched) && (
            <div className={styles.cardContent}>
              <img src={card.image} alt={card.name} className={styles.pokemonImage} />
              <div className={styles.pokemonName}>{card.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
