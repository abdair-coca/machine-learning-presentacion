import { useEffect, useRef, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Sliders } from 'lucide-react';
import type { ParameterSpec } from '../../types/lesson';
import styles from './ParameterPanel.module.css';

interface Props {
  parameters: ParameterSpec[];
  values: Record<string, number | string>;
  /** Se invoca al "soltar" un slider (commit) o al cambiar el select. Debounced por el padre si aplica. */
  onCommit: (next: Record<string, number | string>) => void;
}

/**
 * Panel de sliders + selects vinculados a ParameterSpec[].
 *
 * Los sliders mantienen un estado LOCAL mientras el usuario arrastra
 * (feedback visual inmediato del número) y solo emiten `onCommit` cuando
 * el usuario suelta (Radix `onValueCommit`). Esto evita re-ejecutar Python
 * en cada frame del arrastre.
 */
export function ParameterPanel({ parameters, values, onCommit }: Props) {
  // Estado local de UI (se sincroniza con `values` cuando llega de fuera)
  const [local, setLocal] = useState<Record<string, number | string>>(values);
  const lastExternal = useRef(values);

  useEffect(() => {
    if (lastExternal.current !== values) {
      setLocal(values);
      lastExternal.current = values;
    }
  }, [values]);

  function commitOne(key: string, value: number | string) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onCommit(next);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <Sliders size={14} />
        <span>Hiperparámetros</span>
      </div>

      <div className={styles.list}>
        {parameters.map((p) =>
          p.type === 'number' ? (
            <NumberRow
              key={p.key}
              spec={p}
              value={typeof local[p.key] === 'number' ? (local[p.key] as number) : (p.default as number)}
              onPreview={(v) => setLocal((s) => ({ ...s, [p.key]: v }))}
              onCommit={(v) => commitOne(p.key, v)}
            />
          ) : (
            <SelectRow
              key={p.key}
              spec={p}
              value={String(local[p.key] ?? p.default)}
              onCommit={(v) => commitOne(p.key, v)}
            />
          ),
        )}
      </div>
    </div>
  );
}

function NumberRow({
  spec,
  value,
  onPreview,
  onCommit,
}: {
  spec: ParameterSpec;
  value: number;
  onPreview: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const min = spec.min ?? 0;
  const max = spec.max ?? 100;
  const step = spec.step ?? 1;
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.label}>{spec.label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <Slider.Root
        className={styles.sliderRoot}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onPreview(v[0])}
        onValueCommit={(v) => onCommit(v[0])}
      >
        <Slider.Track className={styles.sliderTrack}>
          <Slider.Range className={styles.sliderRange} />
        </Slider.Track>
        <Slider.Thumb className={styles.sliderThumb} aria-label={spec.label} />
      </Slider.Root>
      <div className={styles.minmax}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function SelectRow({
  spec,
  value,
  onCommit,
}: {
  spec: ParameterSpec;
  value: string;
  onCommit: (v: string) => void;
}) {
  const options = spec.options ?? [];
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.label}>{spec.label}</span>
      </div>
      <div className={styles.chipGroup} role="radiogroup" aria-label={spec.label}>
        {options.map((o) => {
          const active = String(o.value) === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              data-active={active ? 'true' : undefined}
              className={styles.chip}
              onClick={() => onCommit(String(o.value))}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
