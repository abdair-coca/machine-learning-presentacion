import { linearRegressionLesson } from './linear-regression';
import { MultipleLinearRegressionLesson } from './multiple-linear-regression';
import { mlpXorLesson } from './mlp-xor';
import type { LessonSpec } from '../types/lesson';

/**
 * Registry de lecciones disponibles. Para agregar un nuevo método ML:
 *   1) Crear `<slug>.ts` exportando un LessonSpec.
 *   2) Importarlo aquí y añadirlo al array.
 * No hace falta tocar componentes, routing ni estilos.
 */
export const lessons: LessonSpec[] = [
  linearRegressionLesson,
  MultipleLinearRegressionLesson,
  mlpXorLesson,
];

export function getLesson(slug: string): LessonSpec | undefined {
  return lessons.find((l) => l.slug === slug);
}
