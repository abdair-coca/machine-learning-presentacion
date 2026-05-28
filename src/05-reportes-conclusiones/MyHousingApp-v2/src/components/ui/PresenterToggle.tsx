import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import styles from './PresenterToggle.module.css';

const CLASS = 'presenter-mode';

export function PresenterToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.body.classList.toggle(CLASS, on);
  }, [on]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      }
      if (e.key === 'f' || e.key === 'F') {
        setOn((v) => !v);
      } else if (e.key === 'Escape') {
        setOn(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={styles.btn}
      data-active={on ? 'true' : undefined}
      aria-label="Modo presentación (tecla F)"
      title="Modo presentación · F"
    >
      {on ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
    </button>
  );
}
