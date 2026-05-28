import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'teal' | 'violet' | 'amber' | 'none';
  padded?: boolean;
}

export function Card({ glow = 'none', padded = true, className, ...rest }: CardProps) {
  return (
    <div
      data-glow={glow}
      data-padded={padded ? 'true' : undefined}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
