'use client';

import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  timeRemaining: number;
  totalPlaytime: number;
  isSoloPlayer: boolean;
}

export function TimerDisplay({ timeRemaining, totalPlaytime, isSoloPlayer }: TimerDisplayProps) {
  const isLowTime = timeRemaining <= 10;

  // Format totalPlaytime as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.container} ${!isSoloPlayer && isLowTime ? styles.warning : ''}`}>
      <div className={styles.label}>
        {isSoloPlayer ? '⏱ PLAYTIME' : '⏱ TIME'}
      </div>
      <div className={styles.time}>
        {isSoloPlayer ? formatTime(totalPlaytime) : `${timeRemaining}s`}
      </div>
    </div>
  );
}
