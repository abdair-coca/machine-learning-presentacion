import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import styles from './CodeEditor.module.css';

export interface CodeEditorHandle {
  getValue: () => string;
  setValue: (text: string) => void;
  focus: () => void;
}

interface Props {
  initialDoc: string;
  minHeight?: number;
  maxHeight?: number;
}

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { initialDoc, minHeight = 80, maxHeight = 360 },
  ref,
) {
  const container = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const view = new EditorView({
      doc: initialDoc,
      parent: container.current,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        EditorView.lineWrapping,
        EditorView.theme({
          '&': {
            backgroundColor: 'var(--bg-elevated)',
            fontSize: '13px',
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
          },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)' },
        }),
      ],
    });
    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() ?? '',
    setValue: (text: string) => {
      const v = viewRef.current;
      if (!v) return;
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
    },
    focus: () => viewRef.current?.focus(),
  }));

  return <div ref={container} className={styles.editor} />;
});
