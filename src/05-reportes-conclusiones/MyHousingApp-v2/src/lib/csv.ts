/** Parser CSV ligero (sin dependencias). Asume comillas simples y comas. */
export interface ParsedCsv {
  columns: string[];
  rows: Record<string, string>[];
}

export function parseCsv(text: string): ParsedCsv {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter(Boolean);
  if (!lines.length) return { columns: [], rows: [] };

  const split = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };

  const columns = split(lines[0]).map((c) => c.trim());
  const rows = lines.slice(1).map((line) => {
    const parts = split(line);
    const row: Record<string, string> = {};
    columns.forEach((c, i) => (row[c] = (parts[i] ?? '').trim()));
    return row;
  });
  return { columns, rows };
}

export function toNumber(value: string | undefined): number {
  if (value === undefined || value === '') return NaN;
  return Number(value);
}
