/**
 * @fileoverview Número reproductivo básico R₀ y métricas derivadas.
 * @see docs/02-modelo-matematico.md §2.1
 */

import type { Params } from '../models/types.ts'

/**
 * Calcula el número reproductivo básico R₀ = β / γ.
 *
 * @param p - Parámetros del modelo
 * @returns R₀ (adimensional)
 * @see docs/02-modelo-matematico.md §2.1
 */
export function computeR0(p: Params): number {
  return p.beta / p.gamma
}

/**
 * Calcula el número reproductivo efectivo en el instante t:
 * R_ef(t) = R₀ · S(t) / N.
 *
 * @param r0 - Número reproductivo básico
 * @param S  - Susceptibles en el instante t
 * @param N  - Población total
 * @returns R_ef (adimensional)
 * @see docs/02-modelo-matematico.md §2.1
 */
export function computeReff(r0: number, S: number, N: number): number {
  return (r0 * S) / N
}

/**
 * Cobertura crítica de vacunación p_c tal que la fracción vacunada elimina el brote.
 *
 * ```
 *   p_c = (1 - 1/R₀) / e
 * ```
 *
 * Donde `e` es la eficacia de la vacuna (default 1 = eficacia perfecta).
 *
 * @param r0      - Número reproductivo básico
 * @param efficacy - Eficacia de la vacuna ∈ (0, 1] (default 1)
 * @returns p_c ∈ [0, 1]
 * @see docs/02-modelo-matematico.md §2.1
 */
export function criticalCoverage(r0: number, efficacy = 1): number {
  if (r0 <= 1) return 0
  return (1 - 1 / r0) / efficacy
}
