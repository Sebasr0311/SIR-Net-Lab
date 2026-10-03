/**
 * @fileoverview Integrador de Euler explícito de primer orden.
 * @see docs/02-modelo-matematico.md §2.4
 */

import type { Solver } from './common.ts'
import { buildSeries } from './common.ts'

/**
 * Integra `dy/dt = rhs(t, y)` con el método de Euler explícito (O(h¹)).
 *
 * ```
 *   y_{n+1} = y_n + h · f(t_n, y_n)
 * ```
 *
 * @param rhs  - Función RHS del sistema
 * @param y0   - Condición inicial
 * @param t0   - Tiempo inicial
 * @param t1   - Tiempo final
 * @param opts - Debe incluir `dt`; si no se especifica se usa 0.1
 * @returns Series de tiempo con S, E (opcional), I, R
 * @see docs/02-modelo-matematico.md §2.4
 */
export const euler: Solver = (rhs, y0, t0, t1, opts) => {
  const dt = opts.dt ?? 0.1
  const steps = Math.ceil((t1 - t0) / dt)
  const ts: number[] = []
  const ys: Float64Array[] = []

  let t = t0
  let y = new Float64Array(y0)
  ts.push(t)
  ys.push(new Float64Array(y))

  for (let i = 0; i < steps; i++) {
    const h = Math.min(dt, t1 - t)
    if (h <= 0) break
    const dy = rhs(t, y)
    const yNext = new Float64Array(y.length)
    for (let j = 0; j < y.length; j++) {
      yNext[j] = y[j] + h * dy[j]
    }
    t += h
    y = yNext
    ts.push(t)
    ys.push(new Float64Array(y))
  }

  return buildSeries(ts, ys)
}
