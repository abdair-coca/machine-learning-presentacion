import { motion, AnimatePresence } from 'framer-motion';
import { usePyodide } from '../../hooks/usePyodide';
import styles from './PyodideLoader.module.css';

/** Loader full-screen estilo "booteo de nave" mientras Pyodide arranca. */
export function PyodideLoader() {
  const { status, progress, stepLabel, error } = usePyodide();
  const visible = status !== 'ready';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.grid} aria-hidden />
          <div className={styles.glow} aria-hidden />

          <div className={styles.box}>
            <motion.div
              className={styles.logo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              ml<span>/</span>lab
            </motion.div>

            <div className={styles.statusRow}>
              <span className={styles.dot} data-error={status === 'error'} />
              <span className={styles.statusText}>
                {error ?? (status === 'loading' ? stepLabel : 'Inicializando…')}
              </span>
            </div>

            <div className={styles.barTrack}>
              <motion.div
                className={styles.barFill}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className={styles.tags}>
              <span>Pyodide</span>
              <span>·</span>
              <span>numpy</span>
              <span>·</span>
              <span>pandas</span>
              <span>·</span>
              <span>scikit-learn</span>
              <span>·</span>
              <span>matplotlib</span>
            </div>

            <div className={styles.percent}>{progress.toString().padStart(3, '0')}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
