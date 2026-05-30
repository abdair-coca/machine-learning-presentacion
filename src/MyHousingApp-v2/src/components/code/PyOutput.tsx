import { motion } from 'framer-motion';
import { Plot } from '../data/Plot';
import type { RunResult } from '../../types/lesson';
import styles from './PyOutput.module.css';

interface Props {
  state: 'idle' | 'running' | RunResult;
  placeholder?: string;
}

export function PyOutput({ state, placeholder = 'El output aparecerá aquí tras ejecutar.' }: Props) {
  if (state === 'idle') {
    return <div className={styles.idle}>{placeholder}</div>;
  }
  if (state === 'running') {
    return (
      <div className={styles.running}>
        <span className={styles.dot} /> Ejecutando…
      </div>
    );
  }

  const result = state;
  if (result.error) {
    return (
      <pre className={styles.error}>
        <strong>Error Python:</strong>
        {'\n'}
        {result.error}
      </pre>
    );
  }

  return (
    <motion.div
      key={result.stdout + (result.plotB64?.slice(0, 24) ?? '')}
      className={styles.success}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {result.stdout && <pre className={styles.stdout}>{result.stdout}</pre>}
      {result.plotB64 && <Plot src={result.plotB64} />}
      {!result.stdout && !result.plotB64 && <p className={styles.muted}>(Sin output)</p>}
      {typeof result.durationMs === 'number' && (
        <p className={styles.timing}>Completado en {(result.durationMs / 1000).toFixed(2)}s</p>
      )}
    </motion.div>
  );
}
