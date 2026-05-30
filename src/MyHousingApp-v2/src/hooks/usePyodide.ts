import { usePyStore } from '../store/pyodide';

/** Hook ergonómico para consumir el estado de Pyodide en componentes.
 *  Usa selectores individuales para evitar `getSnapshot should be cached`
 *  (Zustand re-renderiza solo cuando cada slice realmente cambia). */
export function usePyodide() {
  const status = usePyStore((s) => s.status);
  const progress = usePyStore((s) => s.progress);
  const stepLabel = usePyStore((s) => s.stepLabel);
  const error = usePyStore((s) => s.errorMsg);
  return { status, progress, stepLabel, error, ready: status === 'ready' };
}
