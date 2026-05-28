import { useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useCsv } from '../../hooks/useCsv';
import { toNumber } from '../../lib/csv';
import styles from './DatasetStats.module.css';

interface Props {
  csvPath: string;
  targetCol: string;
  targetLabel?: string;
  currency?: boolean;
}

function fmt(v: number, currency: boolean) {
  if (currency) return '$' + Math.round(v).toLocaleString('en-US');
  return Math.round(v).toLocaleString('en-US');
}

function Counter({ to, currency }: { to: number; currency: boolean }) {
  const [val, setVal] = useState('—');
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const controls = animate(0, to, {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setVal(fmt(v, currency)),
            onComplete: () => setVal(fmt(to, currency)),
          });
          obs.disconnect();
          return () => controls.stop();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [to, currency]);

  return <span ref={ref}>{val}</span>;
}

export function DatasetStats({ csvPath, targetCol, targetLabel = 'Target', currency = false }: Props) {
  const csv = useCsv(csvPath);

  const stats = useMemo(() => {
    if (!csv) return null;
    const values = csv.rows.map((r) => toNumber(r[targetCol])).filter((v) => Number.isFinite(v));
    if (!values.length) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      count: csv.rows.length,
      features: csv.columns.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: sum / values.length,
    };
  }, [csv, targetCol]);

  return (
    <div className={styles.grid}>
      <StatCard label="Filas totales" value={stats?.count} />
      <StatCard label="Columnas" value={stats?.features} />
      <StatCard label={`Mínimo · ${targetLabel}`} value={stats?.min} currency={currency} tone="violet" />
      <StatCard label={`Máximo · ${targetLabel}`} value={stats?.max} currency={currency} tone="amber" />
      <StatCard label={`Promedio · ${targetLabel}`} value={stats?.mean} currency={currency} tone="teal" />
    </div>
  );
}

function StatCard({
  label,
  value,
  currency = false,
  tone = 'teal',
}: {
  label: string;
  value: number | undefined;
  currency?: boolean;
  tone?: 'teal' | 'violet' | 'amber';
}) {
  return (
    <div className={styles.card} data-tone={tone}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {typeof value === 'number' ? <Counter to={value} currency={currency} /> : '—'}
      </span>
    </div>
  );
}
