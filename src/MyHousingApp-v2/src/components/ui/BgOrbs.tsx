import styles from './BgOrbs.module.css';

/** Orbes decorativos flotantes que dan profundidad al fondo. */
export function BgOrbs() {
  return (
    <div className={styles.layer} aria-hidden>
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
    </div>
  );
}
