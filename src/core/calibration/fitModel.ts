/**
 * @fileoverview Ajuste de modelos epidémicos SIR / SEIR por mínimos cuadrados no lineales.
 * Utiliza el optimizador Nelder–Mead para estimar los parámetros (β, γ [, I0])
 * minimizando la suma de errores al cuadrado ponderada frente a datos observados.
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.1 & T6.3
 */

import type { Series } from '../models/types.ts'
import { sirRhs } from '../models/sir.ts'
import { seirRhs } from '../models/seir.ts'
import { rk4 } from '../solvers/rk4.ts'
import { nelderMead } from './nelderMead.ts'
import type { Observation } from './syntheticData.ts'

export interface CalibrationParams {
  /** Población total constante N */
  N: number
  /** Observaciones temporales (t_i, y_i) */
  data: Observation[]
  /** Modelo epidémico a ajustar (default 'sir') */
  model?: 'sir' | 'seir'
  /** Tasa de salida de latencia σ (si se usa SEIR) */
  sigma?: number
  /** Infección inicial conocida I0 (opcional, default data[0].I o 1) */
  i0?: number
  /** Si debe estimar I0 conjuntamente con β y γ */
  fitI0?: boolean
  /** Estimación inicial de parámetros */
  initialGuess?: { beta?: number; gamma?: number; i0?: number }
  /** Tolerancia de parada de Nelder-Mead */
  tol?: number
  /** Máximo de iteraciones */
  maxIterations?: number
}

export interface CalibrationResult {
  beta: number
  gamma: number
  i0: number
  r0: number
  rmse: number
  r2: number
  mae: number
  fittedSeries: Series
  residuals: number[]
  iterations: number
  converged: boolean
}

/**
 * Interpola linealmente el valor de I en un instante t a partir de la serie discreta.
 */
export function interpolateI(series: Series, targetT: number): number {
  const { t, I } = series
  const len = t.length
  if (len === 0) return 0
  if (targetT <= (t[0] ?? 0)) return I[0] ?? 0
  if (targetT >= (t[len - 1] ?? 0)) return I[len - 1] ?? 0

  // Búsqueda binaria del intervalo
  let low = 0
  let high = len - 1
  while (low <= high) {
    const mid = (low + high) >> 1
    if ((t[mid] ?? 0) <= targetT) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  const idx0 = Math.max(0, high)
  const idx1 = Math.min(len - 1, idx0 + 1)
  const t0 = t[idx0] ?? 0
  const t1 = t[idx1] ?? 0
  const i0 = I[idx0] ?? 0
  const i1 = I[idx1] ?? 0

  if (Math.abs(t1 - t0) < 1e-12) return i0
  const frac = (targetT - t0) / (t1 - t0)
  return i0 + frac * (i1 - i0)
}

/**
 * Ajusta los parámetros del modelo SIR o SEIR a los datos observados por mínimos cuadrados.
 */
export function fitEpidemicModel(params: CalibrationParams): CalibrationResult {
  const {
    N,
    data,
    model = 'sir',
    sigma = 1.0,
    fitI0 = false,
    initialGuess,
    tol = 1e-6,
    maxIterations = 800,
  } = params

  if (data.length === 0) {
    throw new Error('No se proporcionaron datos de observación para calibrar.')
  }

  const tMax = Math.max(...data.map((d) => d.t))
  const fixedI0 = params.i0 !== undefined ? params.i0 : Math.max(1, data[0]?.I ?? 1)
  const isSeir = model === 'seir'

  // Punto inicial de optimización: [beta, gamma] o [beta, gamma, i0]
  const initBeta = initialGuess?.beta ?? 0.5
  const initGamma = initialGuess?.gamma ?? 0.2
  const initialPoint = fitI0
    ? [initBeta, initGamma, initialGuess?.i0 ?? fixedI0]
    : [initBeta, initGamma]

  // Cotas inferiores: tasas estrictamente positivas
  const lowerBounds = fitI0 ? [0.001, 0.001, 0.5] : [0.001, 0.001]
  const upperBounds = fitI0 ? [5.0, 5.0, N * 0.5] : [5.0, 5.0]

  // Función de integración con caché del último resultado
  function integrate(b: number, g: number, initialI: number): Series {
    const p = {
      N,
      beta: b,
      gamma: g,
      sigma: isSeir ? sigma : undefined,
      i0: initialI,
    }
    const rhs = isSeir ? seirRhs(p) : sirRhs(p)
    const dim = isSeir ? 4 : 3
    const y0 = new Float64Array(dim)
    y0[0] = N - initialI
    if (isSeir) {
      y0[1] = 0
      y0[2] = initialI
      y0[3] = 0
    } else {
      y0[1] = initialI
      y0[2] = 0
    }

    return rk4(rhs, y0, 0, tMax, { dt: 0.1 })
  }

  // Función objetivo SSE
  function sse(point: number[]): number {
    const b = point[0] ?? initBeta
    const g = point[1] ?? initGamma
    const currentI0 = fitI0 ? (point[2] ?? fixedI0) : fixedI0

    const series = integrate(b, g, currentI0)
    let sumSq = 0

    for (let i = 0; i < data.length; i++) {
      const obs = data[i]
      if (!obs) continue
      const modelI = interpolateI(series, obs.t)
      const diff = obs.I - modelI
      sumSq += diff * diff
    }

    return sumSq
  }

  // Ejecutar optimización Nelder–Mead
  const opt = nelderMead(sse, initialPoint, {
    tol,
    maxIterations,
    lowerBounds,
    upperBounds,
    stepSize: 0.1,
  })

  const fittedBeta = opt.point[0] ?? initBeta
  const fittedGamma = opt.point[1] ?? initGamma
  const fittedI0 = fitI0 ? (opt.point[2] ?? fixedI0) : fixedI0
  const fittedR0 = fittedGamma > 0 ? fittedBeta / fittedGamma : 0

  // Serie ajustada final
  const fittedSeries = integrate(fittedBeta, fittedGamma, fittedI0)

  // Calcular métricas de bondad de ajuste
  const residuals: number[] = []
  let sseVal = 0
  let saeVal = 0
  let meanObs = 0

  for (let i = 0; i < data.length; i++) {
    meanObs += data[i]?.I ?? 0
  }
  meanObs /= data.length

  let sstVal = 0

  for (let i = 0; i < data.length; i++) {
    const obs = data[i]
    if (!obs) continue
    const modelI = interpolateI(fittedSeries, obs.t)
    const diff = obs.I - modelI
    residuals.push(diff)
    sseVal += diff * diff
    saeVal += Math.abs(diff)
    const dev = obs.I - meanObs
    sstVal += dev * dev
  }

  const rmse = Math.sqrt(sseVal / data.length)
  const mae = saeVal / data.length
  const r2 = sstVal > 1e-12 ? Math.max(0, 1 - sseVal / sstVal) : 1.0

  return {
    beta: fittedBeta,
    gamma: fittedGamma,
    i0: fittedI0,
    r0: fittedR0,
    rmse,
    r2,
    mae,
    fittedSeries,
    residuals,
    iterations: opt.iterations,
    converged: opt.converged,
  }
}
