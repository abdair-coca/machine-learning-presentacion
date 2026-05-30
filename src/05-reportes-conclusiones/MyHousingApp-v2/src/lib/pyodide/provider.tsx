import { useEffect, useRef, type ReactNode } from 'react';
import { usePyStore, pyodideRef } from '../../store/pyodide';
import { lessons } from '../../lessons';

const PYODIDE_VERSION = '0.26.4';
const CDN_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
const PACKAGES = ['numpy', 'pandas', 'scikit-learn', 'matplotlib'] as const;

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<any>;
  }
}

async function injectPyodideScript(): Promise<void> {
  if (window.loadPyodide) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Pyodide desde la CDN'));
    document.head.appendChild(script);
  });
}

/**
 * Monta una sola instancia de Pyodide.
 * Reemplaza initPyodide() de main.js:85-123.
 */
export function PyodideProvider({ children }: { children: ReactNode }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const store = usePyStore.getState();

    (async () => {
      try {
        store.setStatus('loading', 'Descargando Pyodide…', 5);
        await injectPyodideScript();
        store.setProgress(20, 'Inicializando runtime de Python…');

        const py = await window.loadPyodide!({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
        });
        pyodideRef.current = py;
        store.setProgress(40, 'Instalando paquetes científicos…');

        // Cargamos paquetes con progreso real
        const total = PACKAGES.length;
        for (let i = 0; i < total; i++) {
          const pkg = PACKAGES[i];
          store.setProgress(40 + Math.round(((i + 1) / total) * 50), `Instalando ${pkg}…`);
          await py.loadPackage(pkg);
          usePyStore.getState().addPackages([pkg]);
        }

        // Pre-cargar TODOS los datasets de las lecciones en el FS virtual de Pyodide.
        // Cada lección declara su dataset.path (ej. /datasets/xor.csv) y el código Python
        // los lee como /xor.csv en el FS virtual.
        store.setProgress(95, 'Cargando datasets…');
        const datasetPaths = [...new Set(lessons.map((l) => l.dataset.path).filter(Boolean))];
        await Promise.all(
          datasetPaths.map(async (urlPath) => {
            try {
              const res = await fetch(urlPath);
              const txt = await res.text();
              // /datasets/xor.csv → /xor.csv  (igual que el provider original)
              const vfsPath = '/' + urlPath.split('/').pop();
              py.FS.writeFile(vfsPath, txt);
            } catch (e) {
              console.warn('No se pudo precargar', urlPath, e);
            }
          }),
        );

        // Bridge: exponer publish a Python para que el código pueda hacer
        // `js.window.publishResults({'mse': ..., 'r2': ...})`.
        (window as any).publishResults = (obj: Record<string, unknown>) => {
          // pyodide manda objetos como PyProxy → convertimos
          const plain: Record<string, unknown> = {};
          // PyProxy.toJs() lo convierte a Map; si ya es objeto JS, Object.entries funciona
          const src = (obj as any)?.toJs ? Object.fromEntries((obj as any).toJs()) : obj ?? {};
          for (const [k, v] of Object.entries(src)) plain[k] = v;
          usePyStore.getState().publish(plain);
        };

        store.setStatus('ready', 'Python listo', 100);
      } catch (err) {
        console.error(err);
        usePyStore.getState().setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  return <>{children}</>;
}
