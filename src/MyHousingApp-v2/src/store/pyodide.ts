import { create } from 'zustand';

export type PyStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Estado global compartido entre lecciones.
 *   - `globals` reemplaza el `window.AppState.lastResults` del vanilla:
 *      cualquier código Python publica `mse`, `r2`, `coef`, … aquí.
 *   - El store no guarda la instancia de Pyodide en el state reactivo
 *     (es no-serializable), sino en una ref export aparte.
 */
interface PyState {
  status: PyStatus;
  progress: number;
  stepLabel: string;
  loadedPackages: string[];
  errorMsg?: string;
  globals: Record<string, unknown>;
  setStatus: (s: PyStatus, label?: string, progress?: number) => void;
  setProgress: (p: number, label?: string) => void;
  addPackages: (pkgs: string[]) => void;
  publish: (entries: Record<string, unknown>) => void;
  setError: (msg: string) => void;
}

export const usePyStore = create<PyState>((set) => ({
  status: 'idle',
  progress: 0,
  stepLabel: 'Esperando inicio…',
  loadedPackages: [],
  globals: {},
  setStatus: (status, label, progress) =>
    set((prev) => ({
      status,
      stepLabel: label ?? prev.stepLabel,
      progress: progress ?? prev.progress,
    })),
  setProgress: (progress, label) =>
    set((prev) => ({ progress, stepLabel: label ?? prev.stepLabel })),
  addPackages: (pkgs) =>
    set((prev) => ({ loadedPackages: [...new Set([...prev.loadedPackages, ...pkgs])] })),
  publish: (entries) =>
    set((prev) => ({ globals: { ...prev.globals, ...entries } })),
  setError: (errorMsg) => set({ status: 'error', errorMsg }),
}));

/** Referencia mutable a la instancia (fuera del store reactivo). */
export const pyodideRef: { current: any } = { current: null };
