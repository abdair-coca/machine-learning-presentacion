import { motion } from 'framer-motion';
import styles from './LessonNav.module.css';

export interface LessonTab {
  num: number;
  label: string;
  short?: string;
}

interface Props {
  tabs: LessonTab[];
  current: number;
  onSelect: (n: number) => void;
}

export function LessonNav({ tabs, current, onSelect }: Props) {
  return (
    <nav className={styles.bar} aria-label="Secciones de la lección">
      <div className={styles.inner}>
        <div className={styles.tabs}>
          {tabs.map((t) => {
            const active = t.num === current;
            return (
              <button
                key={t.num}
                type="button"
                className={styles.tab}
                data-active={active ? 'true' : undefined}
                onClick={() => onSelect(t.num)}
              >
                <span className={styles.num}>{String(t.num).padStart(2, '0')}</span>
                <span className={styles.label}>{t.label}</span>
                {active && (
                  <motion.span
                    layoutId="active-tab"
                    className={styles.activeBar}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${(current / tabs.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 28 }}
            />
          </div>
          <span className={styles.counter}>
            {String(current).padStart(2, '0')} / {String(tabs.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </nav>
  );
}
