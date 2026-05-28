import { useCallback } from 'react';
import { pyodideRef, usePyStore } from '../store/pyodide';
import type { RunResult } from '../types/lesson';

/**
 * Ejecuta código Python. Reemplaza runBlock() de main.js:1016-1089.
 *
 * Convenciones para que el código Python publique datos al UI:
 *   - Asignar `__plot_b64__ = "..."` para mostrar un gráfico.
 *   - Llamar `js.window.publishResults({"mse": ..., "r2": ...})`
 *     para alimentar las MetricCard.
 *   - Cualquier cosa que el código retorne (última expresión) se devuelve
 *     en returnValue; si es una string base64 larga sin espacios, se trata
 *     como imagen (compat con bloques del vanilla).
 */
export function useRunPython() {
  return useCallback(async (code: string): Promise<RunResult> => {
    const py = pyodideRef.current;
    const status = usePyStore.getState().status;
    const start = performance.now();

    if (!py || status !== 'ready') {
      return {
        stdout: '',
        error: 'Python todavía está cargando. Espera el indicador verde.',
        durationMs: 0,
      };
    }

    // 1) Redirigir stdout a un buffer en memoria
    py.runPython(`
import sys, io as _io
_stdout_buf = _io.StringIO()
sys.stdout = _stdout_buf
`);

    try {
      const returnValue = await py.runPythonAsync(code);

      const stdout: string = py.runPython(`
sys.stdout = sys.__stdout__
_stdout_buf.getvalue()
`);

      // Detectar plot: variable global __plot_b64__ o retorno base64 largo
      let plotB64: string | undefined;
      try {
        const fromGlobal = py.globals.get('__plot_b64__');
        if (typeof fromGlobal === 'string' && fromGlobal.length > 100) {
          plotB64 = fromGlobal;
          py.globals.delete('__plot_b64__');
        }
      } catch {
        // ignore
      }

      if (
        !plotB64 &&
        typeof returnValue === 'string' &&
        returnValue.length > 100 &&
        !returnValue.includes(' ')
      ) {
        plotB64 = returnValue;
      }

      return {
        stdout,
        plotB64,
        returnValue,
        durationMs: performance.now() - start,
      };
    } catch (err) {
      try {
        py.runPython('sys.stdout = sys.__stdout__');
      } catch {
        // ignore
      }
      return {
        stdout: '',
        error: err instanceof Error ? err.message : String(err),
        durationMs: performance.now() - start,
      };
    }
  }, []);
}
