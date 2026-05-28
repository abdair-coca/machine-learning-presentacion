import { useEffect, useState } from 'react';
import { parseCsv, type ParsedCsv } from '../lib/csv';

/** Carga y parsea un CSV una sola vez (cache por path en memoria). */
const cache = new Map<string, ParsedCsv>();

export function useCsv(path: string) {
  const [data, setData] = useState<ParsedCsv | null>(() => cache.get(path) ?? null);

  useEffect(() => {
    if (cache.has(path)) {
      setData(cache.get(path)!);
      return;
    }
    let aborted = false;
    fetch(path)
      .then((r) => r.text())
      .then((txt) => {
        if (aborted) return;
        const parsed = parseCsv(txt);
        cache.set(path, parsed);
        setData(parsed);
      })
      .catch((e) => console.error('useCsv fetch error', e));
    return () => {
      aborted = true;
    };
  }, [path]);

  return data;
}
