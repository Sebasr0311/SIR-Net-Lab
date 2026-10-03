/**
 * @fileoverview Barrido bidimensional de parámetros (β vs γ) para evaluar paisajes epidemiológicos
 * y bifurcaciones transcríticas (R₀ = 1).
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.2
 */

import { analyticalPeak } from '../analysis/peak.ts'
import { finalSize } from '../analysis/finalSize.ts'

export interface Sweep2DOptions {
  N: number
  i0?: number
  betaRange?: [number, number]
  gammaRange?: [number, number]
  resolution?: number
}

export interface Sweep2DResult {
  betaValues: number[]
  gammaValues: number[]
  /** Matriz peakMatrix[betaIdx][gammaIdx] con el pico máximo de infectados I_max */
  peakMatrix: number[][]
  /** Matriz attackRateMatrix[betaIdx][gammaIdx] con la tasa de ataque final */
  attackRateMatrix: number[][]
  minPeak: number
  maxPeak: number
  /** Línea teórica R₀ = 1 (donde β = γ) */
  thresholdLine: Array<{ beta: number; gamma: number }>
}

/**
 * Computa el barrido paramétrico 2D de β vs γ calculando I_max y la tasa de ataque final.
 */
export function computeSweep2D(opts: Sweep2DOptions): Sweep2DResult {
  const { N, i0 = 1, betaRange = [0.1, 1.2], gammaRange = [0.05, 0.6], resolution = 20 } = opts

  const betaStep = (betaRange[1] - betaRange[0]) / (resolution - 1)
  const gammaStep = (gammaRange[1] - gammaRange[0]) / (resolution - 1)

  const betaValues: number[] = []
  const gammaValues: number[] = []

  for (let i = 0; i < resolution; i++) {
    betaValues.push(Number((betaRange[0] + i * betaStep).toFixed(3)))
    gammaValues.push(Number((gammaRange[0] + i * gammaStep).toFixed(3)))
  }

  const peakMatrix: number[][] = []
  const attackRateMatrix: number[][] = []

  let minPeak = Infinity
  let maxPeak = -Infinity

  for (let r = 0; r < resolution; r++) {
    const b = betaValues[r] ?? 0.5
    const peakRow: number[] = []
    const attackRow: number[] = []

    for (let c = 0; c < resolution; c++) {
      const g = gammaValues[c] ?? 0.2
      const r0 = g > 0 ? b / g : 0

      let peakVal = i0
      let attackRateVal = 0

      if (r0 > 1.0) {
        const peakRes = analyticalPeak({ N, beta: b, gamma: g, i0 })
        peakVal = Math.max(i0, Math.round(peakRes.iMax))

        const finalRes = finalSize({ N, beta: b, gamma: g, i0 })
        attackRateVal = finalRes.attackRate
      }

      if (peakVal < minPeak) minPeak = peakVal
      if (peakVal > maxPeak) maxPeak = peakVal

      peakRow.push(peakVal)
      attackRow.push(Number(attackRateVal.toFixed(4)))
    }

    peakMatrix.push(peakRow)
    attackRateMatrix.push(attackRow)
  }

  // Generar puntos de la recta R₀ = 1 (β = γ) dentro del dominio intersección
  const minCommon = Math.max(betaRange[0], gammaRange[0])
  const maxCommon = Math.min(betaRange[1], gammaRange[1])
  const thresholdLine: Array<{ beta: number; gamma: number }> = []

  if (minCommon <= maxCommon) {
    const nLinePoints = 15
    const lineStep = (maxCommon - minCommon) / (nLinePoints - 1)
    for (let i = 0; i < nLinePoints; i++) {
      const val = minCommon + i * lineStep
      thresholdLine.push({ beta: val, gamma: val })
    }
  }

  return {
    betaValues,
    gammaValues,
    peakMatrix,
    attackRateMatrix,
    minPeak,
    maxPeak,
    thresholdLine,
  }
}
