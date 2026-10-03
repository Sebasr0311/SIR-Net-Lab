/**
 * @fileoverview Modelo SIR clásico (Susceptible–Infectado–Recuperado).
 * @see docs/02-modelo-matematico.md §2.1
 */

import type { Params, RHS } from './types.ts'

/**
 * Construye la función RHS del sistema SIR:
 * ```
 *   dS/dt = -β S I / N
 *   dI/dt =  β S I / N - γ I
 *   dR/dt =  γ I
 * ```
 * Vector de estado `y = [S, I, R]` (índices 0, 1, 2).
 *
 * @param p - Parámetros del modelo (se requieren `N`, `beta`, `gamma`)
 * @returns Función RHS lista para pasarle a un solver
 * @see docs/02-modelo-matematico.md §2.1
 */
export function sirRhs(p: Params): RHS {
  const { N, beta, gamma } = p
  return (_t: number, y: Float64Array): Float64Array => {
    const S = y[0]
    const I = y[1]
    const transmission = (beta * S * I) / N
    const out = new Float64Array(3)
    out[0] = -transmission
    out[1] = transmission - gamma * I
    out[2] = gamma * I
    return out
  }
}
