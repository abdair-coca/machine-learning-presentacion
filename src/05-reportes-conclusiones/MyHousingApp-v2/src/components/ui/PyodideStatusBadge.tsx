import { usePyodide } from '../../hooks/usePyodide';
import styles from './PyodideStatusBadge.module.css';

export function PyodideStatusBadge() {
  const { status, progress } = usePyodide();
  const label =
    status === 'ready' ? 'Python listo'
    : status === 'error' ? 'Python: error'
    : status === 'loading' ? `Python ${progress}%`
    : 'Python: en espera';

  return (
    <span className={styles.badge} data-status={status} title={label}>
      <span className={styles.dot} />
      <span className={styles.text}>{label}</span>
    </span>
  );
}
