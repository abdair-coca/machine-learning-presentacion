import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import type { MetricSpec, VerdictRule } from '../../types/lesson';
import styles from './MetricCard.module.css';

interface Props {
  spec: MetricSpec;
  value: number | undefined;
}

function pickVerdict(value: number, rules?: VerdictRule[]) {
  if (!rules?.length) return null;
  for (const r of rules) {
    if (r.if === 'gte' && value >= (r.value as number)) return r;
    if (r.if === 'lte' && value <= (r.value as number)) return r;
    if (r.if === 'between') {
      const [lo, hi] = r.value as [number, number];
      if (value >= lo && value <= hi) return r;
    }
  }
  return null;
}

function formatValue(value: number, spec: MetricSpec): string {
  const decimals = spec.decimals ?? (spec.format === 'percent' ? 1 : 4);
  switch (spec.format) {
    case 'currency':
      return '$' + value.toLocaleString('en-US', { maximumFractionDigits: decimals });
    case 'percent':
      return (value * 100).toFixed(decimals) + '%';
    case 'decimal':
      return value.toFixed(decimals);
    case 'number':
    default:
      return value.toLocaleString('en-US', { maximumFractionDigits: decimals });
  }
}

export function MetricCard({ spec, value }: Props) {
  const [display, setDisplay] = useState<string>('—');
  const last = useRef<number>(0);

  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      setDisplay('—');
      last.current = 0;
      return;
    }
    const from = last.current;
    const to = value;
    const controls = animate(from, to, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatValue(v, spec)),
      onComplete: () => setDisplay(formatValue(to, spec)),
    });
    last.current = to;
    return () => controls.stop();
  }, [value, spec]);

  const verdict = typeof value === 'number' ? pickVerdict(value, spec.verdict) : null;

  return (
    <motion.div
      className={styles.card}
      data-tone={verdict?.tone}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.label}>{spec.label}</div>
      <div className={styles.value}>
        {display}
        {spec.unit && <span className={styles.unit}>{spec.unit}</span>}
      </div>
      {verdict && (
        <span className={styles.verdict} data-tone={verdict.tone}>
          {verdict.label}
        </span>
      )}
    </motion.div>
  );
}

export function MetricGrid({
  specs,
  values,
}: {
  specs: MetricSpec[];
  values: Record<string, number | undefined>;
}) {
  return (
    <div className={styles.grid}>
      {specs.map((s) => (
        <MetricCard key={s.key} spec={s} value={values[s.key]} />
      ))}
    </div>
  );
}
