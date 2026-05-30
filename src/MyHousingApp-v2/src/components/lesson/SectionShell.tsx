import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import styles from './SectionShell.module.css';

interface Props {
  number: number;
  title: string;
  badge?: string;
  description?: string;
  children: ReactNode;
}

export function SectionShell({ number, title, badge, description, children }: Props) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className={styles.header}>
        <span className={styles.num}>{String(number).padStart(2, '0')}</span>
        <div className={styles.titles}>
          <div className={styles.titleRow}>
            <h2>{title}</h2>
            {badge && <span className={styles.badge}>{badge}</span>}
          </div>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </motion.section>
  );
}
