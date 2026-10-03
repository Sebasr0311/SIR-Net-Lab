/**
 * @fileoverview Simulación de campañas de control por impulsos en EDO (SIR / SEIR).
 * Modela intervenciones de parcheo puntual donde una fracción p_k de la población
 * susceptible se inmuniza en instantes programados t_k:
 *   S(t_k⁺) = S(t_k⁻) · (1 - p_k · e)
 *   R(t_k⁺) = R(t_k⁻) + p_k · e · S(t_k⁻)
 *
 * @see docs/02-modelo-matematico.md §2.2 & §2.5
 * @see docs/06-plan-de-trabajo.md T5.1
 */

import type { Params, Series, SolverOpts } from '../models/types.ts'
import { sirRhs } from '../models/sir.ts'
import { seirRhs } from '../models/seir.ts'
import { rk4 } from '../solvers/rk4.ts'
import { applyPatchImpulses } from '../solvers/events.ts'

export interface PatchImpulse {
  /** Instante de tiempo en el que se ejecuta la campaña */
  t: number
  /** Fracción de susceptibles alcanzados por el parcheo [0, 1] */
  p: number
  /** Eficacia técnica del parcheo [0, 1] (por defecto 1.0) */
  efficacy?: number
}

export interface CampaignComparison {
  /** Serie temporal sin intervención (baseline) */
  baseline: Series
  /** Serie temporal con la campaña de impulsos aplicada */
  controlled: Series
  /** Lista de impulsos efectivos aplicados */
  impulses: PatchImpulse[]
  /** Infecciones totales evitadas (R_base(t_final) - R_ctrl(t_final) ajustado) */
  preventedInfections: number
  /** Reducción absoluta del pico de infección (I_max_base - I_max_ctrl) */
  peakReduction: number
  /** Desplazamiento del día de pico (t_pico_ctrl - t_pico_base) */
  peakTimeShift: number
}

/**
 * Simula y compara un modelo EDO con y sin campañas programadas de impulsos de parcheo.
 */
export function simulateEdoCampaign(
  params: Params,
  impulses: PatchImpulse[],
  tMax: number = 60,
  opts: SolverOpts = { dt: 0.1 }
): CampaignComparison {
  const isSeir = params.sigma !== undefined && params.sigma > 0
  const rhs = isSeir ? seirRhs(params) : sirRhs(params)

  const dim = isSeir ? 4 : 3
  const y0 = new Float64Array(dim)
  y0[0] = params.N - params.i0 // S0
  if (isSeir) {
    y0[1] = 0 // E0
    y0[2] = params.i0 // I0
    y0[3] = 0 // R0
  } else {
    y0[1] = params.i0 // I0
    y0[2] = 0 // R0
  }

  // 1. Simulación base (sin impulsos)
  const baseline = rk4(rhs, y0, 0, tMax, opts)

  // 2. Simulación controlada (con impulsos ordenados)
  const validImpulses = impulses
    .filter((imp) => imp.t >= 0 && imp.t <= tMax && imp.p > 0)
    .sort((a, b) => a.t - b.t)
    .map((imp) => ({
      t: imp.t,
      p: Math.min(1, Math.max(0, imp.p * (imp.efficacy ?? 1.0))),
      efficacy: imp.efficacy ?? 1.0,
    }))

  let controlled: Series
  if (validImpulses.length === 0) {
    controlled = baseline
  } else {
    controlled = applyPatchImpulses(rhs, y0, 0, tMax, validImpulses, opts)
  }

  // Métricas del baseline
  let peakIBase = 0
  let peakTimeBase = 0
  for (let i = 0; i < baseline.I.length; i++) {
    if ((baseline.I[i] ?? 0) > peakIBase) {
      peakIBase = baseline.I[i] ?? 0
      peakTimeBase = baseline.t[i] ?? 0
    }
  }

  // Métricas de la serie controlada
  let peakICtrl = 0
  let peakTimeCtrl = 0
  for (let i = 0; i < controlled.I.length; i++) {
    if ((controlled.I[i] ?? 0) > peakICtrl) {
      peakICtrl = controlled.I[i] ?? 0
      peakTimeCtrl = controlled.t[i] ?? 0
    }
  }

  // Total de susceptibles al final
  const sBaseFinal = baseline.S[baseline.S.length - 1] ?? 0
  const sCtrlFinal = controlled.S[controlled.S.length - 1] ?? 0

  // Personas que evitaron enfermarse
  const preventedInfections = Math.max(0, sCtrlFinal - sBaseFinal)
  const peakReduction = Math.max(0, peakIBase - peakICtrl)
  const peakTimeShift = peakTimeCtrl - peakTimeBase

  return {
    baseline,
    controlled,
    impulses: validImpulses,
    preventedInfections,
    peakReduction,
    peakTimeShift,
  }
}
