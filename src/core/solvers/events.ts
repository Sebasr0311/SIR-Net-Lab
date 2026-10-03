/**
 * @fileoverview Detección de eventos epidemiológicos e impulsos de parcheo.
 * @see docs/02-modelo-matematico.md §2.5
 */

import type { RHS, Series, SolverOpts } from '../models/types.ts'
import type { Params } from '../models/types.ts'
import { rk4 } from './rk4.ts'

/**
 * Resultado de la detección de eventos sobre una serie temporal.
 */
export interface EventResult {
  /** Instante donde dI/dt ≈ 0 (pico epidémico) */
  peakTime: number
  /** Valor máximo de I(t) */
  peakI: number
  /**
   * Instante donde R_ef = R₀ · S(t) / N cruza 1 (de mayor a menor).
   * Si no se cruza, vale -1.
   */
  thresholdTime: number
}

/**
 * Detecta eventos sobre una {@link Series} ya integrada:
 * - **Pico**: instante donde I(t) es máximo.
 * - **Umbral**: primer instante donde R_ef = β/γ · S/N < 1.
 *
 * @param series - Series de tiempo integrada
 * @param params - Parámetros del modelo (se usa `beta`, `gamma`, `N`)
 * @returns {@link EventResult}
 * @see docs/02-modelo-matematico.md §2.5
 */
export function detectEvents(series: Series, params: Params): EventResult {
  const { t, S, I } = series
  const { beta, gamma, N } = params
  const r0 = beta / gamma

  let peakI = -Infinity
  let peakTime = t[0]
  let thresholdTime = -1

  for (let i = 0; i < I.length; i++) {
    if (I[i] > peakI) {
      peakI = I[i]
      peakTime = t[i]
    }
  }

  // Cruce descendente de R_ef = 1
  for (let i = 1; i < S.length; i++) {
    const rEff0 = (r0 * S[i - 1]) / N
    const rEff1 = (r0 * S[i]) / N
    if (rEff0 >= 1 && rEff1 < 1) {
      // Interpolación lineal para mayor precisión
      const frac = (rEff0 - 1) / (rEff0 - rEff1)
      thresholdTime = t[i - 1] + frac * (t[i] - t[i - 1])
      break
    }
  }

  return { peakTime, peakI, thresholdTime }
}

/**
 * Aplica impulsos de parcheo durante la integración (vacunación puntual).
 * En cada instante `t_k`, transfiere una fracción `p_k` de S a R:
 * ```
 *   S ← S · (1 - p_k)
 *   R ← R + p_k · S_antes
 * ```
 * La integración entre impulsos usa RK4 con las opciones dadas.
 *
 * @param rhs      - Función RHS del modelo
 * @param y0       - Condición inicial
 * @param t0       - Tiempo inicial
 * @param t1       - Tiempo final
 * @param impulses - Array `{t, p}` ordenado por `t`; `p ∈ [0, 1]`
 * @param opts     - Opciones del solver (dt, etc.)
 * @returns Series concatenada con todos los segmentos
 * @see docs/02-modelo-matematico.md §2.5
 */
export function applyPatchImpulses(
  rhs: RHS,
  y0: Float64Array,
  t0: number,
  t1: number,
  impulses: Array<{ t: number; p: number }>,
  opts: SolverOpts
): Series {
  // Construye los puntos de corte: inicio, cada impulso, fin
  const breaks = [t0, ...impulses.map((imp) => imp.t), t1]

  const allT: number[] = []
  const allY: Float64Array[] = []

  let currentY = new Float64Array(y0)

  for (let seg = 0; seg < breaks.length - 1; seg++) {
    const segT0 = breaks[seg]
    const segT1 = breaks[seg + 1]
    if (segT1 <= segT0) continue

    const seg_series = rk4(rhs, currentY, segT0, segT1, opts)

    // Añadir puntos del segmento (sin duplicar el primer punto si no es el inicial)
    const startIdx = allT.length === 0 ? 0 : 1
    const dim = currentY.length

    for (let i = startIdx; i < seg_series.t.length; i++) {
      allT.push(seg_series.t[i])
      const yVec = new Float64Array(dim)
      if (dim === 3) {
        yVec[0] = seg_series.S[i]
        yVec[1] = seg_series.I[i]
        yVec[2] = seg_series.R[i]
      } else {
        // SEIR: dim=4
        yVec[0] = seg_series.S[i]
        yVec[1] = seg_series.E?.[i] ?? 0
        yVec[2] = seg_series.I[i]
        yVec[3] = seg_series.R[i]
      }
      allY.push(yVec)
    }

    // Último estado
    const last = seg_series.t.length - 1
    currentY = new Float64Array(dim)
    if (dim === 3) {
      currentY[0] = seg_series.S[last]
      currentY[1] = seg_series.I[last]
      currentY[2] = seg_series.R[last]
    } else {
      currentY[0] = seg_series.S[last]
      currentY[1] = seg_series.E?.[last] ?? 0
      currentY[2] = seg_series.I[last]
      currentY[3] = seg_series.R[last]
    }

    // Aplicar impulso si corresponde
    if (seg < impulses.length) {
      const { p } = impulses[seg]
      const sOld = currentY[0]
      currentY[0] = sOld * (1 - p)
      // R es el último componente
      currentY[dim - 1] += p * sOld
    }
  }

  // Convertir a Series
  const n = allT.length
  const t = new Float64Array(allT)
  const S = new Float64Array(n)
  const I = new Float64Array(n)
  const R = new Float64Array(n)
  const dim = allY[0]?.length ?? 3

  if (dim === 4) {
    const E = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      S[i] = allY[i][0]
      E[i] = allY[i][1]
      I[i] = allY[i][2]
      R[i] = allY[i][3]
    }
    return { t, S, E, I, R }
  } else {
    for (let i = 0; i < n; i++) {
      S[i] = allY[i][0]
      I[i] = allY[i][1]
      R[i] = allY[i][2]
    }
    return { t, S, I, R }
  }
}
