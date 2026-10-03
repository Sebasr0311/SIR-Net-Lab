/**
 * @fileoverview Tipos y utilidades comunes para los integradores numéricos.
 * @see docs/02-modelo-matematico.md §2.4
 */

import type { RHS, Series, SolverOpts } from '../models/types.ts'

export type { RHS, Series, SolverOpts }

/**
 * Firma común para todos los solvers del proyecto.
 * Integra el sistema `dy/dt = rhs(t, y)` desde `t0` hasta `t1`.
 *
 * @param rhs   - Función del lado derecho del sistema ODE
 * @param y0    - Condición inicial
 * @param t0    - Tiempo inicial
 * @param t1    - Tiempo final
 * @param opts  - Opciones del solver (paso, tolerancias, etc.)
 * @returns Series con los valores de t, S, E (opcional), I, R
 */
export type Solver = (
  rhs: RHS,
  y0: Float64Array,
  t0: number,
  t1: number,
  opts: SolverOpts
) => Series

/**
 * Convierte el vector de estado `y` a un objeto {@link Series} según la
 * dimensión del sistema (3 = SIR, 4 = SEIR).
 *
 * @internal
 */
export function buildSeries(ts: number[], ys: Float64Array[]): Series {
  const n = ts.length
  const t = new Float64Array(n)
  const S = new Float64Array(n)
  const I = new Float64Array(n)
  const R = new Float64Array(n)

  const dim = ys[0]?.length ?? 3

  if (dim === 4) {
    // SEIR: y = [S, E, I, R]
    const E = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      t[i] = ts[i]
      S[i] = ys[i][0]
      E[i] = ys[i][1]
      I[i] = ys[i][2]
      R[i] = ys[i][3]
    }
    return { t, S, E, I, R }
  } else if (dim === 3) {
    // SIR o SEIS
    for (let i = 0; i < n; i++) {
      t[i] = ts[i]
      S[i] = ys[i][0]
      I[i] = ys[i][1]
      R[i] = ys[i][2]
    }
    return { t, S, I, R }
  } else {
    // Fallback genérico: asume SIR
    for (let i = 0; i < n; i++) {
      t[i] = ts[i]
      S[i] = ys[i][0]
      I[i] = ys[i][1]
      R[i] = ys[i][2]
    }
    return { t, S, I, R }
  }
}
