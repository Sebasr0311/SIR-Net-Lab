/**
 * @fileoverview Análisis de Sensibilidad Global (GSA) mediante Monte Carlo y Latin Hypercube Sampling.
 * Propaga la incertidumbre paramétrica hacia las salidas del sistema epidémico (R₀, I_max, tasa de ataque),
 * computa intervalos de confianza empíricos, probabilidad de brote y distribuciones de frecuencia.
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.3
 */

import { generateLhsSamples, type ParameterRange } from './lhs.ts'
import { analyticalPeak } from '../analysis/peak.ts'
import { finalSize } from '../analysis/finalSize.ts'

export interface HistogramBin {
  x0: number
  x1: number
  count: number
}

export interface MetricDistribution {
  mean: number
  std: number
  median: number
  p5: number
  p95: number
  min: number
  max: number
  histogram: HistogramBin[]
}

export interface GlobalSensitivityResult {
  sampleCount: number
  outbreakProbability: number // P(R0 > 1)
  severeOutbreakProbability: number // P(I_max > 0.1 * N)
  r0Dist: MetricDistribution
  peakIDist: MetricDistribution
  attackRateDist: MetricDistribution
  correlations: Array<{ param: string; correlationWithPeak: number }>
}

/**
 * Calcula el cuantil q ∈ [0, 1] de un array ordenado.
 */
function quantile(sorted: number[], q: number): number {
  const n = sorted.length
  if (n === 0) return 0
  const pos = (n - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const val0 = sorted[base] ?? 0
  const val1 = sorted[base + 1] ?? val0
  return val0 + rest * (val1 - val0)
}

/**
 * Construye un histograma de frecuencias a partir de una serie numérica.
 */
function computeHistogram(values: number[], nBins: number = 20): HistogramBin[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (Math.abs(max - min) < 1e-12) {
    return [{ x0: min, x1: max, count: values.length }]
  }

  const binWidth = (max - min) / nBins
  const bins: HistogramBin[] = Array.from({ length: nBins }, (_, i) => ({
    x0: min + i * binWidth,
    x1: min + (i + 1) * binWidth,
    count: 0,
  }))

  for (const v of values) {
    const idx = Math.min(nBins - 1, Math.floor((v - min) / binWidth))
    if (bins[idx]) {
      bins[idx].count++
    }
  }

  return bins
}

/**
 * Calcula estadísticas descriptivas completas para una distribución de muestras.
 */
function summarizeDistribution(values: number[], nBins: number = 20): MetricDistribution {
  if (values.length === 0) {
    return { mean: 0, std: 0, median: 0, p5: 0, p95: 0, min: 0, max: 0, histogram: [] }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const sum = sorted.reduce((acc, v) => acc + v, 0)
  const mean = sum / n

  const variance = sorted.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / n
  const std = Math.sqrt(variance)

  return {
    mean: Number(mean.toFixed(2)),
    std: Number(std.toFixed(2)),
    median: Number(quantile(sorted, 0.5).toFixed(2)),
    p5: Number(quantile(sorted, 0.05).toFixed(2)),
    p95: Number(quantile(sorted, 0.95).toFixed(2)),
    min: Number((sorted[0] ?? 0).toFixed(2)),
    max: Number((sorted[n - 1] ?? 0).toFixed(2)),
    histogram: computeHistogram(sorted, nBins),
  }
}

/**
 * Coeficiente de correlación de Pearson entre dos vectores numéricos.
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n !== y.length || n === 0) return 0

  let sumX = 0
  let sumY = 0
  for (let i = 0; i < n; i++) {
    sumX += x[i]!
    sumY += y[i]!
  }
  const meanX = sumX / n
  const meanY = sumY / n

  let num = 0
  let denX = 0
  let denY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i]! - meanX
    const dy = y[i]! - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }

  const den = Math.sqrt(denX * denY)
  if (den < 1e-12) return 0
  return Number((num / den).toFixed(3))
}

export interface GlobalSensitivityOptions {
  N: number
  i0?: number
  ranges: ParameterRange[]
  sampleCount?: number
  seed?: number
}

/**
 * Ejecuta el análisis de sensibilidad global mediante LHS.
 */
export function runGlobalSensitivity(opts: GlobalSensitivityOptions): GlobalSensitivityResult {
  const { N, i0 = 1, ranges, sampleCount = 1000, seed = 42 } = opts

  const samples = generateLhsSamples(ranges, sampleCount, seed)

  const r0Values: number[] = []
  const peakIValues: number[] = []
  const attackRateValues: number[] = []

  let outbreakCount = 0
  let severeOutbreakCount = 0

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]!
    const beta = s.beta ?? 0.6
    const gamma = s.gamma ?? 0.2
    const currentI0 = s.i0 ?? i0

    const r0 = gamma > 0 ? beta / gamma : 0
    r0Values.push(r0)

    let peak = currentI0
    let attack = 0

    if (r0 > 1.0) {
      outbreakCount++
      const peakRes = analyticalPeak({ N, beta, gamma, i0: currentI0 })
      peak = Math.max(currentI0, peakRes.iMax)

      const finalRes = finalSize({ N, beta, gamma, i0: currentI0 })
      attack = finalRes.attackRate

      if (peak > 0.1 * N) {
        severeOutbreakCount++
      }
    }

    peakIValues.push(peak)
    attackRateValues.push(attack)
  }

  // Correlaciones con el pico de infectados
  const correlations: Array<{ param: string; correlationWithPeak: number }> = []
  for (const r of ranges) {
    const paramVals = samples.map((s) => s[r.name] ?? 0)
    const corr = pearsonCorrelation(paramVals, peakIValues)
    correlations.push({ param: r.name, correlationWithPeak: corr })
  }
  correlations.sort((a, b) => Math.abs(b.correlationWithPeak) - Math.abs(a.correlationWithPeak))

  return {
    sampleCount,
    outbreakProbability: Number((outbreakCount / sampleCount).toFixed(4)),
    severeOutbreakProbability: Number((severeOutbreakCount / sampleCount).toFixed(4)),
    r0Dist: summarizeDistribution(r0Values),
    peakIDist: summarizeDistribution(peakIValues),
    attackRateDist: summarizeDistribution(attackRateValues),
    correlations,
  }
}
