import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { lessons } from '../lessons';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.tag}>
          <Sparkles size={14} /> Curso interactivo de Machine Learning
        </div>
        <h1>
          Aprende ML <span className={styles.gradient}>ejecutando código real</span> en el navegador.
        </h1>
        <p>
          Cada lección combina conceptos, dataset, código editable y métricas en vivo. Python corre
          dentro de tu navegador con Pyodide — sin servidores ni instalaciones.
        </p>
      </section>

      <section className={styles.gridSection}>
        <header className={styles.gridHead}>
          <h2>Métodos disponibles</h2>
          <span className={styles.count}>{lessons.length} lección{lessons.length === 1 ? '' : 'es'}</span>
        </header>

        <div className={styles.grid}>
          {lessons.map((l, i) => (
            <motion.div
              key={l.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/lesson/${l.slug}`} className={styles.card} data-accent={l.accent}>
                <div className={styles.icon} aria-hidden>{l.icon}</div>
                <div className={styles.diff}>{l.difficulty}</div>
                <h3>{l.title}</h3>
                <p>{l.subtitle}</p>
                <span className={styles.cta}>
                  Abrir lección <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}

          <div className={styles.placeholder}>
            <div className={styles.icon}>➕</div>
            <h3>Más métodos en camino</h3>
            <p>Regresión logística, KNN, árboles, K-Means…</p>
          </div>
        </div>
      </section>
    </div>
  );
}
