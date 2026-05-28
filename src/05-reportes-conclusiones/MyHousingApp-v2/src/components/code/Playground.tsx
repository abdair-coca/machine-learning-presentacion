import { useRef, useState } from 'react';
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
}

export function Playground({ initialCode, title = 'Playground', description }: Props) {
  const editor = useRef<CodeEditorHandle | null>(null);
  const run = useRunPython();
  const { ready } = usePyodide();
  const [state, setState] = useState<'idle' | 'running' | RunResult>('idle');

  async function handleRun() {
    if (!editor.current) return;
    setState('running');
    const result = await run(editor.current.getValue());
    setState(result);
  }

  function handleReset() {
    editor.current?.setValue(initialCode);
    setState('idle');
  }

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
            Ejecutar todo
          </Button>
        </div>
      </header>

      <CodeEditor ref={editor} initialDoc={initialCode} minHeight={320} maxHeight={560} />

      <PyOutput state={state} placeholder="Edita el código y presiona Ejecutar para ver los resultados." />
    </section>
  );
}
