/**
 * @fileoverview Análisis de sensibilidad local normalizada (índices de elasticidad) para modelos epidémicos.
 * Calcula las derivadas parciales normalizadas S_p^Y = (∂Y/∂p) * (p/Y) mediante diferencias centrales
 * finitas para evaluar la influencia relativa de cada parámetro sobre métricas críticas
 * (R₀, I_max, t_pico, tamaño final).
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.1
 */

import type { Params } from '../models/types.ts'
import { computeR0 } from '../analysis/r0.ts'
import { analyticalPeak } from '../analysis/peak.ts'
import { finalSize } from '../analysis/finalSize.ts'
import { sirRhs } from '../models/sir.ts'
import { rk4 } from '../solvers/rk4.ts'
import { detectEvents } from '../solvers/events.ts'

export type SensitivityMetric = 'r0' | 'peakI' | 'peakTime' | 'attackRate'
export type SensitivityParam = 'beta' | 'gamma' | 'sigma' | 'i0' | 'N'

export interface ParameterSensitivity {
  param: SensitivityParam
  value: number
  index: number // Elasticidad S_p^Y = (∂Y/∂p) * (p/Y)
  absoluteIndex: number
}

export interface LocalSensitivityReport {
  metric: SensitivityMetric
  baseValue: number
  parameters: ParameterSensitivity[]
}

/**
 * Evalúa una métrica dada Y(p) para un conjunto de parámetros.
 */
function evaluateMetric(metric: SensitivityMetric, p: Params): number {
  switch (metric) {
    case 'r0':
      return computeR0(p)

    case 'peakI': {
      const r0 = computeR0(p)
      if (r0 <= 1) return p.i0
      return analyticalPeak(p).iMax
    }

    case 'peakTime': {
      const r0 = computeR0(p)
      if (r0 <= 1) return 0
      const rhs = sirRhs(p)
      const y0 = new Float64Array([p.N - p.i0, p.i0, 0])
      const series = rk4(rhs, y0, 0, 100, { dt: 0.1 })
      const events = detectEvents(series, p)
      return events.peakTime
    }

    case 'attackRate': {
      const res = finalSize(p)
      return res.attackRate
    }
  }
}

/**
 * Calcula los índices de sensibilidad local normalizada mediante diferencias centrales finitas.
 * S_p^Y = [ (Y(p + h) - Y(p - h)) / (2 * h) ] * (p / Y(p))
 */
export function computeLocalSensitivity(
  baseParams: Params,
  metric: SensitivityMetric = 'peakI',
  relativeDelta: number = 0.01
): LocalSensitivityReport {
  const baseValue = evaluateMetric(metric, baseParams)
  const evaluatedParams: SensitivityParam[] = ['beta', 'gamma', 'i0', 'N']

  const sensitivities: ParameterSensitivity[] = []

  for (const param of evaluatedParams) {
    const origVal = baseParams[param] ?? 1.0

    // Perturbación central finita: h = origVal * relativeDelta
    const h = Math.max(1e-6, origVal * relativeDelta)

    const paramsPlus: Params = { ...baseParams, [param]: origVal + h }
    const paramsMinus: Params = { ...baseParams, [param]: Math.max(1e-6, origVal - h) }

    const yPlus = evaluateMetric(metric, paramsPlus)
    const yMinus = evaluateMetric(metric, paramsMinus)

    let elasticity = 0
    if (Math.abs(baseValue) > 1e-12) {
      const dyDp = (yPlus - yMinus) / (2 * h)
      elasticity = dyDp * (origVal / baseValue)
    }

    sensitivities.push({
      param,
      value: origVal,
      index: Number(elasticity.toFixed(4)),
      absoluteIndex: Number(Math.abs(elasticity).toFixed(4)),
    })
  }

  // Ordenar de mayor a menor impacto absoluto (convención para gráfico tornado)
  sensitivities.sort((a, b) => b.absoluteIndex - a.absoluteIndex)

  return {
    metric,
    baseValue,
    parameters: sensitivities,
  }
}
