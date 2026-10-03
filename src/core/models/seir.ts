/**
 * @fileoverview Modelo SEIR con parcheo preventivo (vacunación/patching).
 * @see docs/02-modelo-matematico.md §2.2
 */

import type { Params, RHS } from './types.ts'

/**
 * Construye la función RHS del sistema SEIR con parcheo:
 * ```
 *   dS/dt = -β S I / N - ν S
 *   dE/dt =  β S I / N - σ E
 *   dI/dt =  σ E - γ I
 *   dR/dt =  γ I + ν S
 * ```
 * Vector de estado `y = [S, E, I, R]` (índices 0, 1, 2, 3).
 *
 * @param p - Parámetros del modelo; `sigma` y `nu` son opcionales (default 0)
 * @returns Función RHS lista para pasarle a un solver
 * @see docs/02-modelo-matematico.md §2.2
 */
export function seirRhs(p: Params): RHS {
  const { N, beta, gamma } = p
  const sigma = p.sigma ?? 0
  const nu = p.nu ?? 0
  return (_t: number, y: Float64Array): Float64Array => {
    const S = y[0]
    const E = y[1]
    const I = y[2]
    const transmission = (beta * S * I) / N
    const out = new Float64Array(4)
    out[0] = -transmission - nu * S
    out[1] = transmission - sigma * E
    out[2] = sigma * E - gamma * I
    out[3] = gamma * I + nu * S
    return out
  }
}
