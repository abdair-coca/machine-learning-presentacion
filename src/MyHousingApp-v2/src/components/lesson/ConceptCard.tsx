import { motion } from 'framer-motion';
import type { ConceptCardSpec } from '../../types/lesson';
import styles from './ConceptCard.module.css';

export function ConceptCard({ spec, index = 0 }: { spec: ConceptCardSpec; index?: number }) {
  return (
    <motion.article
      className={styles.card}
      data-accent={spec.accent ?? 'teal'}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.icon} aria-hidden>{spec.icon}</div>
      <h3>{spec.title}</h3>
      <p>{spec.body}</p>
    </motion.article>
  );
}

export function ConceptGrid({ items }: { items: ConceptCardSpec[] }) {
  return (
    <div className={styles.grid}>
      {items.map((it, i) => (
        <ConceptCard key={it.title} spec={it} index={i} />
      ))}
    </div>
  );
}
