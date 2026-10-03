/**
 * @fileoverview Integrador Dormand-Prince RK45 con paso adaptativo.
 * @see docs/02-modelo-matematico.md #seccion-2.4
 *
 * Implementa el tableau de Butcher de Dormand-Prince (DOPRI5).
 * Control de paso: h_new = h * clamp(0.9 * (tol/err)^(1/5), 0.2, 5).
 */

import type { Solver } from './common.ts'
import { buildSeries } from './common.ts'

// ── Coeficientes del tableau de Dormand-Prince ────────────────────────────────
const C2 = 1 / 5
const C3 = 3 / 10
const C4 = 4 / 5
const C5 = 8 / 9

const A21 = 1 / 5

const A31 = 3 / 40
const A32 = 9 / 40

const A41 = 44 / 45
const A42 = -56 / 15
const A43 = 32 / 9

const A51 = 19372 / 6561
const A52 = -25360 / 2187
const A53 = 64448 / 6561
const A54 = -212 / 729

const A61 = 9017 / 3168
const A62 = -355 / 33
const A63 = 46732 / 5247
const A64 = 49 / 176
const A65 = -5103 / 18656

// Coeficientes de orden 5 (solucion principal)
const B1 = 35 / 384
const B3 = 500 / 1113
const B4 = 125 / 192
const B5 = -2187 / 6784
const B6 = 11 / 84

// Coeficientes de error (diferencia orden 5 - orden 4)
const E1 = 71 / 57600
const E3 = -71 / 16695
const E4 = 71 / 1920
const E5 = -17253 / 339200
const E6 = 22 / 525
const E7 = -1 / 40

/**
 * Suma ponderada: out[j] = y[j] + h * sum_i(ws[i] * ks[i][j])
 * Siempre retorna un Float64Array nuevo con ArrayBuffer propio.
 */
function weightedSum(
  y: Float64Array<ArrayBuffer>,
  h: number,
  ks: Float64Array<ArrayBuffer>[],
  ws: number[]
): Float64Array<ArrayBuffer> {
  const n = y.length
  const out = new Float64Array(n)
  for (let j = 0; j < n; j++) {
    let acc = y[j]
    for (let i = 0; i < ks.length; i++) {
      acc += h * ws[i] * ks[i][j]
    }
    out[j] = acc
  }
  return out
}

/**
 * Integra dy/dt = rhs(t, y) con el metodo Dormand-Prince RK45 adaptativo.
 *
 * El error se estima como la norma mixta (SC = atol + |y| * rtol):
 * err = sqrt( sum((e_i / SC_i)^2) / n ).
 *
 * @param rhs  - Funcion RHS del sistema
 * @param y0   - Condicion inicial
 * @param t0   - Tiempo inicial
 * @param t1   - Tiempo final
 * @param opts - rtol (default 1e-6), atol (default 1e-9), maxSteps (default 100000)
 * @returns Series de tiempo con S, E (opcional), I, R
 * @see docs/02-modelo-matematico.md #seccion-2.4
 */
export const dopri5: Solver = (rhs, y0, t0, t1, opts) => {
  const rtol = opts.rtol ?? 1e-6
  const atol = opts.atol ?? 1e-9
  const maxSteps = opts.maxSteps ?? 100_000

  const ts: number[] = []
  const ys: Float64Array<ArrayBuffer>[] = []

  let t = t0
  // Siempre trabajamos con Float64Array<ArrayBuffer>
  let y: Float64Array<ArrayBuffer> = new Float64Array(y0)
  ts.push(t)
  ys.push(new Float64Array(y))

  // Paso inicial heuristico
  let h = (t1 - t0) * 0.01

  let stepCount = 0

  while (t < t1) {
    if (stepCount++ > maxSteps) break
    h = Math.min(h, t1 - t)
    if (h <= 0) break

    // Etapas del tableau DOPRI5
    // rhs retorna Float64Array<ArrayBufferLike>; copiamos a ArrayBuffer propio
    const k1: Float64Array<ArrayBuffer> = new Float64Array(rhs(t, y))
    const k2: Float64Array<ArrayBuffer> = new Float64Array(
      rhs(t + C2 * h, weightedSum(y, h, [k1], [A21]))
    )
    const k3: Float64Array<ArrayBuffer> = new Float64Array(
      rhs(t + C3 * h, weightedSum(y, h, [k1, k2], [A31, A32]))
    )
    const k4: Float64Array<ArrayBuffer> = new Float64Array(
      rhs(t + C4 * h, weightedSum(y, h, [k1, k2, k3], [A41, A42, A43]))
    )
    const k5: Float64Array<ArrayBuffer> = new Float64Array(
      rhs(t + C5 * h, weightedSum(y, h, [k1, k2, k3, k4], [A51, A52, A53, A54]))
    )
    const k6: Float64Array<ArrayBuffer> = new Float64Array(
      rhs(t + h, weightedSum(y, h, [k1, k2, k3, k4, k5], [A61, A62, A63, A64, A65]))
    )

    // Solucion de orden 5
    const yNext = weightedSum(y, h, [k1, k3, k4, k5, k6], [B1, B3, B4, B5, B6])

    // k7 = f(t+h, yNext) — necesario para el estimador de error DOPRI5
    const k7: Float64Array<ArrayBuffer> = new Float64Array(rhs(t + h, yNext))

    // Estimador de error (diferencia orden 5 - orden 4)
    let errSum = 0
    for (let j = 0; j < y.length; j++) {
      const e = h * (E1 * k1[j] + E3 * k3[j] + E4 * k4[j] + E5 * k5[j] + E6 * k6[j] + E7 * k7[j])
      const sc = atol + Math.max(Math.abs(y[j]), Math.abs(yNext[j])) * rtol
      errSum += (e / sc) ** 2
    }
    const err = Math.sqrt(errSum / y.length)

    if (err <= 1.0) {
      // Paso aceptado
      t += h
      y = yNext
      ts.push(t)
      ys.push(new Float64Array(y))
    }

    // Ajuste del paso (rechazado o aceptado)
    const factor = err === 0 ? 5 : Math.min(5, Math.max(0.2, 0.9 * Math.pow(1 / err, 0.2)))
    h *= factor
  }

  return buildSeries(ts, ys)
}
