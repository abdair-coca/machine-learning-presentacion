import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePyStore } from '../../store/pyodide';
import type { LessonSpec, RunResult } from '../../types/lesson';
import { useSectionRouter } from '../../hooks/useSectionRouter';
import { Typewriter } from '../ui/Typewriter';
import { Button } from '../ui/Button';
import { LessonNav, type LessonTab } from './LessonNav';
import { ConceptGrid } from './ConceptCard';
import { ConclusionsMD } from './ConclusionsMD';
import { CodeBlock } from '../code/CodeBlock';
import { Playground } from '../code/Playground';
import { MetricGrid } from '../data/MetricCard';
import { DatasetTable } from '../data/DatasetTable';
import { DatasetStats } from '../data/DatasetStats';
import { ParameterPanel } from '../interactive/ParameterPanel';
import { applyParams, defaultParamValues } from '../../lib/templating';
import styles from './Lesson.module.css';

const TABS: LessonTab[] = [
  { num: 1, label: '¿Qué es?' },
  { num: 2, label: 'Dataset' },
  { num: 3, label: 'Código' },
  { num: 4, label: 'Playground' },
  { num: 5, label: 'Reporte' },
  { num: 6, label: 'Conclusiones' },
];

const SECTION_TITLE: Record<number, string> = {
  1: '¿De qué trata el método?',
  2: 'El dataset',
  3: 'Código explicado, paso a paso',
  4: 'Playground · experimenta',
  5: 'Reporte de métricas',
  6: 'Conclusiones',
};

const SECTION_DESC: Record<number, string> = {
  1: 'Conceptos clave antes de tocar código.',
  2: 'Conoce de cerca los datos sobre los que entrenarás el modelo.',
  3: 'Cada bloque es editable. Ejecuta y experimenta libremente.',
  4: 'Modifica el pipeline completo y mide cómo cambian las métricas.',
  5: 'Los valores se actualizan al ejecutar el código del bloque 5 o el Playground.',
  6: 'Lo que aprendiste y por dónde seguir.',
};

export function Lesson({ spec }: { spec: LessonSpec }) {
  const { current, goTo } = useSectionRouter(TABS.length, 1);
  const globals = usePyStore((s) => s.globals);

  /**
   * Métricas locales del Playground. NO usan el store global a propósito:
   * así el panel "Métricas en vivo" sólo se llena cuando el usuario ejecuta
   * el código del propio Playground, no cuando ejecuta bloques de la
   * sección 3 (que también publican al store global y alimentan el Reporte).
   */
  const [playgroundMetrics, setPlaygroundMetrics] = useState<Record<string, number | undefined>>({});

  // Valores actuales de los sliders/selects del Playground.
  // Cuando cambian, `effectivePlaygroundCode` se recalcula y Playground (con
  // autoRunOnCodeChange) sincroniza el editor y re-ejecuta debounced.
  const [paramValues, setParamValues] = useState<Record<string, number | string>>(() =>
    defaultParamValues(spec.parameters),
  );

  const hasParams = !!spec.parameters?.length;
  const effectivePlaygroundCode = useMemo(
    () => (hasParams ? applyParams(spec.playgroundCode, paramValues) : spec.playgroundCode),
    [spec.playgroundCode, paramValues, hasParams],
  );

  function handlePlaygroundResult(result: RunResult) {
    if (result.error || !result.published) return;
    const next: Record<string, number | undefined> = {};
    for (const m of spec.metrics) {
      const raw = result.published[m.key];
      next[m.key] = typeof raw === 'number' ? raw : undefined;
    }
    setPlaygroundMetrics(next);
  }

  function handlePlaygroundReset() {
    setPlaygroundMetrics({});
  }

  const metricValues: Record<string, number | undefined> = {};
  for (const m of spec.metrics) {
    const raw = globals[m.key];
    metricValues[m.key] = typeof raw === 'number' ? raw : undefined;
  }

  return (
    <article className={styles.lesson}>
      <header className={styles.hero}>
        <motion.div
          className={styles.crumb}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span>{spec.icon}</span>
          <span>Lección · {spec.difficulty}</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <Typewriter text={spec.title} speed={45} startDelay={250} />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {spec.subtitle}
        </motion.p>
      </header>

      <LessonNav tabs={TABS} current={current} onSelect={goTo} />

      <div className={styles.stage}>
        <div className={styles.stageInner}>
          <AnimatePresence mode="wait">
            <motion.section
              key={current}
              className={styles.section}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className={styles.sectionHead}>
                <span className={styles.sectionNum}>{String(current).padStart(2, '0')}</span>
                <div>
                  <h2>{SECTION_TITLE[current]}</h2>
                  <p>{SECTION_DESC[current]}</p>
                </div>
              </header>

              <div className={styles.sectionBody}>
                {current === 1 && (
                  <div className="reveal-stagger">
                    <ConceptGrid items={spec.concepts} />
                  </div>
                )}

                {current === 2 && (
                  <>
                    <DatasetStats
                      csvPath={spec.dataset.path}
                      targetCol={spec.dataset.targetCol}
                      targetLabel={spec.dataset.targetCol}
                      currency={spec.dataset.targetIsCurrency ?? true}
                    />
                    <DatasetTable
                      csvPath={spec.dataset.path}
                      visibleColumns={spec.datasetView.visibleColumns}
                      filters={spec.datasetView.filters}
                      pageSize={spec.datasetView.pageSize ?? 12}
                    />
                  </>
                )}

                {current === 3 && (
                  <>
                    <div className={styles.codeProgress}>
                      <div className={styles.codeProgressTrack}>
                        <div className={styles.codeProgressFill} style={{ width: '0%' }} />
                      </div>
                      <span className={styles.codeProgressLabel}>
                        {spec.codeSteps.length} bloques · ejecuta en orden o desordenado
                      </span>
                    </div>
                    <div className={styles.codeStack}>
                      {spec.codeSteps.map((s, i) => (
                        <CodeBlock key={s.id} step={s} index={i} total={spec.codeSteps.length} />
                      ))}
                    </div>
                  </>
                )}

                {current === 4 && (() => {
                  const hasPlaygroundMetrics = Object.values(playgroundMetrics).some(
                    (v) => typeof v === 'number',
                  );
                  return (
                    <div className={styles.split}>
                      <div className={styles.splitMain}>
                        <Playground
                          initialCode={effectivePlaygroundCode}
                          title={spec.title}
                          onResult={handlePlaygroundResult}
                          onReset={handlePlaygroundReset}
                          autoRunOnCodeChange={hasParams}
                          debounceMs={300}
                        />
                      </div>
                      <aside className={styles.splitSide}>
                        {hasParams && spec.parameters && (
                          <ParameterPanel
                            parameters={spec.parameters}
                            values={paramValues}
                            onCommit={setParamValues}
                          />
                        )}
                        <div className={styles.sideLabel}>
                          Métricas del Playground
                          {hasPlaygroundMetrics && <span className={styles.sideDot} aria-hidden />}
                        </div>
                        <MetricGrid specs={spec.metrics} values={playgroundMetrics} />
                        <p className={styles.sideHint}>
                          {hasPlaygroundMetrics
                            ? hasParams
                              ? 'Mueve los sliders: el modelo se reentrena automáticamente al soltar.'
                              : 'Resultados de tu última ejecución. Cambia parámetros y vuelve a ejecutar.'
                            : hasParams
                              ? 'Mueve un slider o pulsa "Ejecutar" para entrenar la red.'
                              : 'Ejecuta el código del Playground para ver tus métricas aquí.'}
                        </p>
                      </aside>
                    </div>
                  );
                })()}

                {current === 5 && (
                  <>
                    <MetricGrid specs={spec.metrics} values={metricValues} />
                  </>
                )}

                {current === 6 && <ConclusionsMD content={spec.conclusionsMd} />}
              </div>

              <footer className={styles.sectionFoot}>
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<ChevronLeft size={14} />}
                  onClick={() => goTo(current - 1)}
                  disabled={current === 1}
                >
                  Anterior
                </Button>
                <span className={styles.footHint}>
                  Sección {current} de {TABS.length}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => goTo(current + 1)}
                  disabled={current === TABS.length}
                >
                  Siguiente <ChevronRight size={14} />
                </Button>
              </footer>
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}
