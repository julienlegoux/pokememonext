'use client';

import { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Reusable modal component with TUI-style border
 */
export function Modal({ title, children, footer, className }: ModalProps) {
  // Generate border decorations based on title length
  const getBorderLength = () => {
    const baseLength = Math.max(title.length, 12);
    return '─'.repeat(baseLength);
  };

  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${className || ''}`}>
        <div className={styles.modalHeader}>
          <h2>┌─ {title} ─┐</h2>
        </div>

        {children}

        <div className={styles.modalFooter}>
          <p>└{getBorderLength()}┘</p>
        </div>
      </div>
    </div>
  );
}
