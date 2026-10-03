/**
 * @fileoverview Integrador Runge–Kutta de cuarto orden (RK4) con paso fijo.
 * @see docs/02-modelo-matematico.md §2.4
 */

import type { Solver } from './common.ts'
import { buildSeries } from './common.ts'

/**
 * Integra `dy/dt = rhs(t, y)` con el método clásico RK4 (O(h⁴)).
 *
 * ```
 *   k1 = f(t, y)
 *   k2 = f(t + h/2, y + h/2 · k1)
 *   k3 = f(t + h/2, y + h/2 · k2)
 *   k4 = f(t + h,   y + h   · k3)
 *   y_{n+1} = y_n + h/6 (k1 + 2k2 + 2k3 + k4)
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
export const rk4: Solver = (rhs, y0, t0, t1, opts) => {
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

    const k1 = rhs(t, y)
    const y2 = new Float64Array(y.length)
    for (let j = 0; j < y.length; j++) y2[j] = y[j] + (h / 2) * k1[j]

    const k2 = rhs(t + h / 2, y2)
    const y3 = new Float64Array(y.length)
    for (let j = 0; j < y.length; j++) y3[j] = y[j] + (h / 2) * k2[j]

    const k3 = rhs(t + h / 2, y3)
    const y4 = new Float64Array(y.length)
    for (let j = 0; j < y.length; j++) y4[j] = y[j] + h * k3[j]

    const k4 = rhs(t + h, y4)

    const yNext = new Float64Array(y.length)
    for (let j = 0; j < y.length; j++) {
      yNext[j] = y[j] + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])
    }

    t += h
    y = yNext
    ts.push(t)
    ys.push(new Float64Array(y))
  }

  return buildSeries(ts, ys)
}
