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
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched && !card.isLoading) {
      onFlip(card.id);
    }
  };

  return (
    <div
      className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.flipped : ''} ${
        card.isMatched ? styles.matched : ''
      } ${card.isLoading ? styles.loading : ''}`}
      onClick={handleClick}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardFront}>
          <div className={styles.cardBack}>?</div>
        </div>
        <div className={styles.cardBack}>
          {(card.isFlipped || card.isMatched) && (
            <div className={styles.cardContent}>
              {card.isLoading ? (
                <div className={styles.spinner}>
                  <div className={styles.spinnerCircle}></div>
                  <div className={styles.loadingText}>Loading...</div>
                </div>
              ) : !imageError ? (
                <>
                  {imageLoading && (
                    <div className={styles.spinner}>
                      <div className={styles.spinnerCircle}></div>
                    </div>
                  )}
                  <Image
                    src={card.image}
                    alt={card.name}
                    className={styles.pokemonImage}
                    width={96}
                    height={96}
                    loading="lazy"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageLoading(false)}
                    style={{ opacity: imageLoading ? 0 : 1 }}
                  />
                </>
              ) : (
                <div className={styles.imagePlaceholder}>
                  {card.name.charAt(0).toUpperCase()}
                </div>
              )}
              {!card.isLoading && <div className={styles.pokemonName}>{card.name}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
