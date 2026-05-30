import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { PyOutput } from './PyOutput';
import { Button } from '../ui/Button';
import { useRunPython } from '../../hooks/useRunPython';
import { usePyodide } from '../../hooks/usePyodide';
import type { RunResult } from '../../types/lesson';
import styles from './Playground.module.css';

interface Props {
  initialCode: string;
  title?: string;
  description?: string;
  /** Se invoca tras cada ejecución exitosa con el RunResult — incluye `published`. */
  onResult?: (result: RunResult) => void;
  /** Se invoca al pulsar "Restablecer". Útil para limpiar paneles externos. */
  onReset?: () => void;
  /**
   * Si está activo, cuando `initialCode` cambia (por ejemplo porque los sliders
   * inyectaron nuevos hiperparámetros), el editor se sincroniza y se re-ejecuta
   * con `debounceMs`. El primer mount NO dispara ejecución automática.
   */
  autoRunOnCodeChange?: boolean;
  debounceMs?: number;
}

export function Playground({
  initialCode,
  title = 'Playground',
  description,
  onResult,
  onReset,
  autoRunOnCodeChange = false,
  debounceMs = 300,
}: Props) {
  const editor = useRef<CodeEditorHandle | null>(null);
  const run = useRunPython();
  const { ready } = usePyodide();
  const [state, setState] = useState<'idle' | 'running' | RunResult>('idle');
  const lastCodeRef = useRef(initialCode);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  async function executeCode(code: string) {
    setState('running');
    const result = await run(code);
    setState(result);
    if (onResult) onResult(result);
  }

  async function handleRun() {
    if (!editor.current) return;
    await executeCode(editor.current.getValue());
  }

  function handleReset() {
    editor.current?.setValue(initialCode);
    lastCodeRef.current = initialCode;
    setState('idle');
    if (onReset) onReset();
  }

  // Sincronizar el editor con cambios externos del código (sliders).
  // En el primer mount no se ejecuta nada.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      lastCodeRef.current = initialCode;
      return;
    }
    if (initialCode === lastCodeRef.current) return;
    editor.current?.setValue(initialCode);
    lastCodeRef.current = initialCode;
    if (!autoRunOnCodeChange) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (ready) executeCode(initialCode);
    }, debounceMs);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, autoRunOnCodeChange, debounceMs, ready]);

  return (
    <section className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <div className={styles.label}>
            <Zap size={14} /> Editor completo
          </div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </header>

      <CodeEditor ref={editor} initialDoc={initialCode} minHeight={320} maxHeight={560} />
      <div className={styles.actions}>
        <Button variant="ghost" size="md" iconLeft={<RotateCcw size={16} />} onClick={handleReset}>
          Restablecer
        </Button>
        <Button
          variant="primary"
          size="md"
          iconLeft={<Play size={16} />}
          onClick={handleRun}
          disabled={!ready || state === 'running'}
          loading={state === 'running'}
        >
          Ejecutar
        </Button>
      </div>

      <PyOutput state={state} placeholder="Edita el código y presiona Ejecutar para ver los resultados." />
    </section>
  );
}
