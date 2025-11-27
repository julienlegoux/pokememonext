'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/lib/types';
import styles from './PokemonCard.module.css';

interface PokemonCardProps {
  card: Card;
  onFlip: (cardId: number) => void;
  disabled?: boolean;
}

export function PokemonCard({ card, onFlip, disabled }: PokemonCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched && !card.isLoading) {
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
          {(card.isFlipped || card.isMatched) && !card.isLoading && (
            <div className={styles.cardContent}>
              {!imageError ? (
                <Image
                  src={card.image}
                  alt={card.name}
                  className={styles.pokemonImage}
                  width={96}
                  height={96}
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  {card.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.pokemonName}>{card.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
