import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { parseCsv, toNumber } from '../../lib/csv';
import type { FilterSpec } from '../../types/lesson';
import { Button } from '../ui/Button';
import styles from './DatasetTable.module.css';

interface Props {
  csvPath: string;
  visibleColumns: string[];
  filters?: FilterSpec[];
  pageSize?: number;
}

export function DatasetTable({ csvPath, visibleColumns, filters = [], pageSize = 12 }: Props) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [page, setPage] = useState(0);
  const [filterValues, setFilterValues] = useState<Record<string, { min: string; max: string }>>(() =>
    Object.fromEntries(filters.map((f) => [f.column, { min: '', max: '' }])),
  );

  useEffect(() => {
    let aborted = false;
    fetch(csvPath)
      .then((r) => r.text())
      .then((txt) => {
        if (aborted) return;
        const parsed = parseCsv(txt);
        setRows(parsed.rows);
      })
      .catch((e) => console.error('No se pudo cargar el CSV:', e));
    return () => {
      aborted = true;
    };
  }, [csvPath]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      for (const f of filters) {
        if (f.type !== 'range') continue;
        const v = toNumber(r[f.column]);
        const { min, max } = filterValues[f.column] ?? { min: '', max: '' };
        if (min !== '' && v < Number(min)) return false;
        if (max !== '' && v > Number(max)) return false;
      }
      return true;
    });
  }, [rows, filters, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const slice = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  function resetFilters() {
    setFilterValues(Object.fromEntries(filters.map((f) => [f.column, { min: '', max: '' }])));
    setPage(0);
  }

  return (
    <div className={styles.wrap}>
      {filters.length > 0 && (
        <div className={styles.filters}>
          {filters.map((f) =>
            f.type === 'range' ? (
              <div key={f.column} className={styles.filter}>
                <label>{f.label}</label>
                <div className={styles.range}>
                  <input
                    type="number"
                    placeholder={f.min !== undefined ? `Min ${f.min}` : 'Min'}
                    value={filterValues[f.column]?.min ?? ''}
                    onChange={(e) => {
                      setFilterValues((v) => ({ ...v, [f.column]: { ...v[f.column], min: e.target.value } }));
                      setPage(0);
                    }}
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder={f.max !== undefined ? `Max ${f.max}` : 'Max'}
                    value={filterValues[f.column]?.max ?? ''}
                    onChange={(e) => {
                      setFilterValues((v) => ({ ...v, [f.column]: { ...v[f.column], max: e.target.value } }));
                      setPage(0);
                    }}
                  />
                </div>
              </div>
            ) : null,
          )}
          <Button variant="ghost" size="sm" iconLeft={<Eraser size={14} />} onClick={resetFilters}>
            Limpiar
          </Button>
        </div>
      )}

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i}>
                {visibleColumns.map((c) => (
                  <td key={c}>{r[c]}</td>
                ))}
              </tr>
            ))}
            {!slice.length && (
              <tr>
                <td colSpan={visibleColumns.length} className={styles.empty}>
                  Sin filas que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className={styles.foot}>
        <span className={styles.count}>
          {filtered.length} filas {rows.length !== filtered.length && `(de ${rows.length})`} ·
          página {currentPage + 1} / {totalPages}
        </span>
        <div className={styles.pager}>
          <Button
            variant="subtle"
            size="sm"
            iconLeft={<ChevronLeft size={14} />}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Anterior
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Siguiente <ChevronRight size={14} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
