/**
 * @fileoverview Generador de datos sintéticos con ruido para pruebas de calibración y validación.
 * Integra la EDO conocida y añade perturbación gaussiana N(0, σ²):
 *   y_i = max(0, I(t_i) + ε_i),  ε_i ~ N(0, σ²)
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.2
 */

import { createRng } from '../rng.ts'
import type { Params } from '../models/types.ts'
import { sirRhs } from '../models/sir.ts'
import { seirRhs } from '../models/seir.ts'
import { rk4 } from '../solvers/rk4.ts'

export interface Observation {
  t: number
  I: number
}

/**
 * Genera una variable aleatoria normal N(0, 1) usando la transformada de Box–Muller.
 */
function sampleNormal(rng: () => number): number {
  let u1 = rng()
  let u2 = rng()
  // Evitar log(0)
  while (u1 <= 1e-12) u1 = rng()
  while (u2 <= 1e-12) u2 = rng()
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
}

export interface SyntheticDataOptions {
  params: Params
  tMax?: number
  dtObs?: number
  noiseSigma?: number
  seed?: number
}

/**
 * Genera observaciones sintéticas de infectados activos I(t) a partir de parámetros conocidos.
 */
export function generateSyntheticData(opts: SyntheticDataOptions): Observation[] {
  const { params, tMax = 50, dtObs = 1.0, noiseSigma = 5.0, seed = 42 } = opts

  const rng = createRng(seed)
  const isSeir = params.sigma !== undefined && params.sigma > 0
  const rhs = isSeir ? seirRhs(params) : sirRhs(params)

  const dim = isSeir ? 4 : 3
  const y0 = new Float64Array(dim)
  y0[0] = params.N - params.i0
  if (isSeir) {
    y0[1] = 0
    y0[2] = params.i0
    y0[3] = 0
  } else {
    y0[1] = params.i0
    y0[2] = 0
  }

  // Paso fino de integración
  const series = rk4(rhs, y0, 0, tMax, { dt: 0.05 })

  const observations: Observation[] = []
  let nextTargetTime = 0

  for (let i = 0; i < series.t.length; i++) {
    const tVal = series.t[i] ?? 0
    if (tVal >= nextTargetTime - 1e-6) {
      const cleanI = series.I[i] ?? 0
      const noise = noiseSigma > 0 ? sampleNormal(rng) * noiseSigma : 0
      const noisyI = Math.max(0, Math.round(cleanI + noise))

      observations.push({
        t: Number(tVal.toFixed(2)),
        I: noisyI,
      })

      nextTargetTime += dtObs
      if (nextTargetTime > tMax + 1e-6) break
    }
  }

  return observations
}
