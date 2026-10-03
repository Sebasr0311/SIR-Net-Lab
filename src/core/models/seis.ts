/**
 * @fileoverview Modelo SEIS con reinfección (sin inmunidad permanente).
 * @see docs/02-modelo-matematico.md §2.2
 */

import type { Params, RHS } from './types.ts'

/**
 * Construye la función RHS del sistema SEIS con reinfección:
 * ```
 *   dS/dt = -β S I / N - ν S + ω (N - S - E - I)
 *   dE/dt =  β S I / N - σ E
 *   dI/dt =  σ E - γ I
 * ```
 * `R = N - S - E - I` (implícito; no se almacena en `y`).
 * Vector de estado `y = [S, E, I]` (índices 0, 1, 2).
 *
 * @param p - Parámetros del modelo; `sigma`, `nu` y `omega` son opcionales (default 0)
 * @returns Función RHS lista para pasarle a un solver
 * @see docs/02-modelo-matematico.md §2.2
 */
export function seisRhs(p: Params): RHS {
  const { N, beta, gamma } = p
  const sigma = p.sigma ?? 0
  const nu = p.nu ?? 0
  const omega = p.omega ?? 0
  return (_t: number, y: Float64Array): Float64Array => {
    const S = y[0]
    const E = y[1]
    const I = y[2]
    const R = N - S - E - I
    const transmission = (beta * S * I) / N
    const out = new Float64Array(3)
    out[0] = -transmission - nu * S + omega * R
    out[1] = transmission - sigma * E
    out[2] = sigma * E - gamma * I
    return out
  }
}
