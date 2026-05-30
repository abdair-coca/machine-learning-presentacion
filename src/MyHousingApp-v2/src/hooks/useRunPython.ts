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
 *
 * Importante: el hook captura LOCALMENTE lo que el código publicó durante esta
 * llamada (en `result.published`), además de alimentar el store global. Así un
 * consumidor (p.ej. el panel del Playground) puede mostrar SOLO las métricas
 * de su propia ejecución, sin contaminarse con las de otros bloques.
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

    // 2) Interceptar publishResults para capturar localmente lo de ESTA ejecución
    const captured: Record<string, unknown> = {};
    const originalPublish = (window as any).publishResults as
      | ((obj: Record<string, unknown>) => void)
      | undefined;
    (window as any).publishResults = (obj: Record<string, unknown>) => {
      const src = (obj as any)?.toJs
        ? Object.fromEntries((obj as any).toJs())
        : obj ?? {};
      for (const [k, v] of Object.entries(src)) captured[k] = v;
      // Seguimos delegando al original (que alimenta el store global usado por la sección Reporte)
      if (originalPublish) originalPublish(obj);
    };

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
        published: Object.keys(captured).length ? captured : undefined,
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
    } finally {
      // Restaurar el publisher original (idempotente)
      (window as any).publishResults = originalPublish;
    }
  }, []);
}
