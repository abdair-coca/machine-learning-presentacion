import { useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { PyOutput } from './PyOutput';
import { Button } from '../ui/Button';
import { useRunPython } from '../../hooks/useRunPython';
import { usePyodide } from '../../hooks/usePyodide';
import type { CodeStep, RunResult } from '../../types/lesson';
import styles from './CodeBlock.module.css';

interface Props {
  step: CodeStep;
  index: number;
  total: number;
}

export function CodeBlock({ step, index, total }: Props) {
  const editor = useRef<CodeEditorHandle | null>(null);
  const run = useRunPython();
  const { ready } = usePyodide();
  const [state, setState] = useState<'idle' | 'running' | RunResult>('idle');

  async function handleRun() {
    if (!editor.current) return;
    setState('running');
    const code = editor.current.getValue();
    const result = await run(code);
    setState(result);
  }

  function handleReset() {
    editor.current?.setValue(step.code);
    setState('idle');
  }

  return (
    <article className={styles.block} id={`block-${step.id}`}>
      <header className={styles.head}>
        <div className={styles.meta}>
          <span className={styles.num}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <h3>{step.title}</h3>
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" iconLeft={<RotateCcw size={14} />} onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Play size={14} />}
            onClick={handleRun}
            disabled={!ready || state === 'running'}
            loading={state === 'running'}
          >
            Ejecutar
          </Button>
        </div>
      </header>

      {step.explanationMd && (
        <div className={styles.explanation}>
          <ReactMarkdown>{step.explanationMd}</ReactMarkdown>
        </div>
      )}

      <CodeEditor ref={editor} initialDoc={step.code} />

      <PyOutput state={state} />
    </article>
  );
}
