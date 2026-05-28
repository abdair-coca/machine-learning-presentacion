import { useCallback, useEffect, useState } from 'react';

/**
 * Sincroniza la sección activa con `location.hash` (#01, #02, …).
 * Permite deep-linking (`/lesson/foo#03`) y navegación con back/forward.
 */
export function useSectionRouter(total: number, fallback = 1) {
  const read = useCallback((): number => {
    if (typeof window === 'undefined') return fallback;
    const raw = window.location.hash.replace('#', '');
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1 && n <= total) return n;
    return fallback;
  }, [total, fallback]);

  const [current, setCurrent] = useState<number>(read);

  useEffect(() => {
    const onPop = () => setCurrent(read());
    window.addEventListener('hashchange', onPop);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('hashchange', onPop);
      window.removeEventListener('popstate', onPop);
    };
  }, [read]);

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.max(1, Math.min(total, n));
      const hash = '#' + String(clamped).padStart(2, '0');
      if (window.location.hash !== hash) {
        history.pushState({}, '', window.location.pathname + window.location.search + hash);
      }
      setCurrent(clamped);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [total],
  );

  return { current, goTo, total };
}
