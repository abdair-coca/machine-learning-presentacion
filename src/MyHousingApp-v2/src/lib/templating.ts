/**
 * Sustitución de placeholders `{{key}}` en strings de código Python.
 * Usado por las lecciones con `parameters` para que el editor del Playground
 * refleje los valores actuales de los sliders.
 *
 * Reglas de quoting:
 *   - números → tal cual (1, 0.5)
 *   - strings → entre comillas simples ('relu') para que sea Python literal válido
 */
export function applyParams(code: string, values: Record<string, number | string>): string {
  let result = code;
  for (const [k, raw] of Object.entries(values)) {
    const literal = typeof raw === 'number' ? String(raw) : `'${String(raw).replace(/'/g, "\\'")}'`;
    // Reemplazo global del placeholder {{key}}
    result = result.split(`{{${k}}}`).join(literal);
  }
  return result;
}

/** Construye el diccionario inicial de valores a partir del spec de parámetros. */
export function defaultParamValues(
  params: { key: string; default: number | string }[] | undefined,
): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const p of params ?? []) out[p.key] = p.default;
  return out;
}
