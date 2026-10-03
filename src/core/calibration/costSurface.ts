/**
 * @fileoverview Evaluación de la superficie de costo 2D (β vs γ) para análisis de identificabilidad.
 * Muestra el valle elíptico de covarianza donde distintas combinaciones de (β, γ) producen
 * un R₀ similar (identificabilidad práctica en modelos epidemiológicos).
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.3
 */

import { sirRhs } from '../models/sir.ts'
import { rk4 } from '../solvers/rk4.ts'
import type { Observation } from './syntheticData.ts'
import { interpolateI } from './fitModel.ts'

export interface CostSurfaceGrid {
  betaValues: number[]
  gammaValues: number[]
  /** Matriz 2D de RMSE[betaIdx][gammaIdx] */
  costMatrix: number[][]
  minCost: number
  maxCost: number
  bestBeta: number
  bestGamma: number
}

export interface CostSurfaceOptions {
  data: Observation[]
  N: number
  i0?: number
  betaRange?: [number, number]
  gammaRange?: [number, number]
  resolution?: number
}

export function computeCostSurface(opts: CostSurfaceOptions): CostSurfaceGrid {
  const {
    data,
    N,
    i0 = 1,
    betaRange = [0.2, 1.0],
    gammaRange = [0.05, 0.4],
    resolution = 20,
  } = opts

  const tMax = Math.max(...data.map((d) => d.t))
  const betaStep = (betaRange[1] - betaRange[0]) / (resolution - 1)
  const gammaStep = (gammaRange[1] - gammaRange[0]) / (resolution - 1)

  const betaValues: number[] = []
  const gammaValues: number[] = []

  for (let i = 0; i < resolution; i++) {
    betaValues.push(Number((betaRange[0] + i * betaStep).toFixed(3)))
    gammaValues.push(Number((gammaRange[0] + i * gammaStep).toFixed(3)))
  }

  const costMatrix: number[][] = []
  let minCost = Infinity
  let maxCost = -Infinity
  let bestBeta = betaRange[0]
  let bestGamma = gammaRange[0]

  const y0 = new Float64Array([N - i0, i0, 0])

  for (let r = 0; r < resolution; r++) {
    const b = betaValues[r] ?? 0.5
    const row: number[] = []

    for (let c = 0; c < resolution; c++) {
      const g = gammaValues[c] ?? 0.2
      const rhs = sirRhs({ N, beta: b, gamma: g, i0 })
      const series = rk4(rhs, y0, 0, tMax, { dt: 0.1 })

      let sse = 0
      for (let k = 0; k < data.length; k++) {
        const obs = data[k]
        if (!obs) continue

        const modelI = interpolateI(series, obs.t)
        const diff = obs.I - modelI
        sse += diff * diff
      }

      const rmse = Math.sqrt(sse / data.length)
      row.push(rmse)

      if (rmse < minCost) {
        minCost = rmse
        bestBeta = b
        bestGamma = g
      }
      if (rmse > maxCost) {
        maxCost = rmse
      }
    }

    costMatrix.push(row)
  }

  return {
    betaValues,
    gammaValues,
    costMatrix,
    minCost,
    maxCost,
    bestBeta,
    bestGamma,
  }
}
