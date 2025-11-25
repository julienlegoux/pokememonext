'use client';

import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  timeRemaining: number;
}

export function TimerDisplay({ timeRemaining }: TimerDisplayProps) {
  const isLowTime = timeRemaining <= 10;

  return (
    <div className={`${styles.container} ${isLowTime ? styles.warning : ''}`}>
      <div className={styles.label}>⏱ TIME</div>
      <div className={styles.time}>{timeRemaining}s</div>
    </div>
  );
}
