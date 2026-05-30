/**
 * LessonSpec — contrato de una lección de ML.
 * Agregar un nuevo método (logística, KNN, árbol, …) = crear un archivo
 * en src/lessons/ que exporte un objeto de este tipo. Cero código React nuevo.
 */

export type AccentColor = 'teal' | 'violet' | 'amber' | 'coral';

export interface ConceptCardSpec {
  icon: string;
  title: string;
  body: string;
  accent?: AccentColor;
}

export interface FilterSpec {
  column: string;
  type: 'range' | 'select';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface PlotSpec {
  id: string;
  title: string;
  pythonCode: string;
}

export interface DatasetView {
  visibleColumns: string[];
  filters: FilterSpec[];
  plots: PlotSpec[];
  pageSize?: number;
}

export interface CodeStep {
  id: string;
  title: string;
  explanationMd: string;
  code: string;
  expectsPlot?: boolean;
}

export interface MetricSpec {
  key: string;
  label: string;
  unit?: string;
  format?: 'number' | 'percent' | 'currency' | 'decimal';
  decimals?: number;
  source: 'global' | 'stdout-regex';
  pattern?: string;
  verdict?: VerdictRule[];
}

export interface VerdictRule {
  if: 'gte' | 'lte' | 'between';
  value: number | [number, number];
  label: string;
  tone: 'good' | 'medium' | 'poor';
}

export interface ParameterSpec {
  key: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  options?: { value: string | number; label: string }[];
}

export interface DatasetConfig {
  path: string;
  targetCol: string;
  featureCols: string[];
  meanTarget?: number;
  /** Si el target es moneda (precio). Default true. Pásalo false para clasificación, ratios, etc. */
  targetIsCurrency?: boolean;
}

export interface LessonSpec {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: AccentColor;
  difficulty: 'intro' | 'intermedio' | 'avanzado';
  dataset: DatasetConfig;
  concepts: ConceptCardSpec[];
  datasetView: DatasetView;
  codeSteps: CodeStep[];
  playgroundCode: string;
  metrics: MetricSpec[];
  parameters?: ParameterSpec[];
  conclusionsMd: string;
}

/** Resultado de ejecutar un bloque Python. */
export interface RunResult {
  stdout: string;
  plotB64?: string;
  returnValue?: unknown;
  error?: string;
  durationMs: number;
  /** Lo que el código publicó vía `js.window.publishResults({...})` DURANTE esta ejecución (no globalmente). */
  published?: Record<string, unknown>;
}
