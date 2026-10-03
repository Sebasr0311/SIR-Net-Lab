/**
 * @fileoverview Utilidad para renderizado de expresiones matemáticas con KaTeX.
 * Provee funciones seguras para renderizar fórmulas inline y en bloque display.
 *
 * @see docs/06-plan-de-trabajo.md T8.1
 */

import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Renderiza una expresión TeX en formato HTML display block.
 */
export function renderMathBlock(tex: string): string {
  try {
    return katex.renderToString(tex, {
      displayMode: true,
      throwOnError: false,
    })
  } catch {
    return `<code class="math-fallback">${tex}</code>`
  }
}

/**
 * Renderiza una expresión TeX en formato HTML inline.
 */
export function renderMathInline(tex: string): string {
  try {
    return katex.renderToString(tex, {
      displayMode: false,
      throwOnError: false,
    })
  } catch {
    return `<code class="math-fallback">${tex}</code>`
  }
}
