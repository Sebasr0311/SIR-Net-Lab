/**
 * @fileoverview Pico analítico del modelo SIR.
 * @see docs/02-modelo-matematico.md §2.1
 */

import type { Params } from '../models/types.ts'

/**
 * Calcula el pico analítico de infectados y los susceptibles en ese instante.
 *
 * La expresión analítica se deduce de la trayectoria en el plano (S, I):
 * ```
 *   I_max = I₀ + S₀ - (N/R₀) · (1 + ln(R₀ · S₀ / N))
 *   S_pico = N / R₀
 * ```
 *
 * @param p - Parámetros del modelo (`N`, `beta`, `gamma`, `i0`)
 * @returns `{ iMax, sAtPeak }` — ambos en unidades de individuos
 * @see docs/02-modelo-matematico.md §2.1
 */
export function analyticalPeak(p: Params): { iMax: number; sAtPeak: number } {
  const { N, beta, gamma, i0 } = p
  const s0 = N - i0
  const r0 = beta / gamma
  const sAtPeak = N / r0
  const iMax = i0 + s0 - sAtPeak * (1 + Math.log((r0 * s0) / N))
  return { iMax, sAtPeak }
}
