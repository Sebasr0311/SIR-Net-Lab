/**
 * @fileoverview Tamanio final de la epidemia (ecuacion trascendental).
 * @see docs/02-modelo-matematico.md #seccion-2.1
 */

import type { Params } from '../models/types.ts'

/**
 * Calcula el tamanio final de la epidemia S-infinito mediante biseccion.
 *
 * La ecuacion trascendental es:
 *   ln(S-inf / S0) = -(R0 / N) * (N' - S-inf)
 *   N' = S0 + I0
 *
 * donde S-inf es el numero de susceptibles que sobreviven la epidemia.
 *
 * Reescrita como g(x) = ln(x/S0) + (R0/N)*(N' - x) = 0.
 * Hay dos raices: x = S0 (trivial, sin epidemia) y x = S-inf < S0 (la relevante).
 *
 * @param p - Parametros del modelo
 * @returns Objeto con sInfinity y attackRate (fraccion que se infecto)
 * @see docs/02-modelo-matematico.md #seccion-2.1
 */
export function finalSize(p: Params): { sInfinity: number; attackRate: number } {
  const { N, beta, gamma, i0 } = p
  const s0 = N - i0
  const r0 = beta / gamma
  const nPrime = s0 + i0 // = N

  // g(x) = ln(x/s0) + (r0/N)*(nPrime - x)
  // g(s0) = 0 + (r0/N)*i0 > 0 (siempre positivo)
  // g(x->0) -> -infinito
  // La raiz relevante esta en (eps, s0); buscamos donde g cruza de neg a pos.
  // Nota: cuando R0 <= 1, la unica raiz fisica es S0 (sin epidemia).

  if (r0 <= 1) {
    // Sin epidemia
    return { sInfinity: s0, attackRate: 0 }
  }

  const g = (x: number): number => Math.log(x / s0) + (r0 / N) * (nPrime - x)

  // Biseccion en (eps, s0 * (1 - eps2)) para encontrar la raiz NOT trivial
  // La raiz no trivial satisface x < s0 * (1 - epsilon)
  // Verificamos que g(lo) < 0 y g(hi) > 0
  let lo = 1e-10
  // hi debe estar estrictamente menor que s0 para evitar la raiz trivial
  // Buscamos un hi donde g(hi) < 0 para acotar la raiz correcta
  // g decrece desde +inf cerca de s0 hacia -inf en x=0
  // Buscar hi donde g < 0
  let hi = s0 * 0.999 // Evitamos la raiz trivial en s0

  // Si g(hi) >= 0, reducir hi hasta que sea negativo
  // (la raiz no trivial existe entre 0 y el punto donde g=0 por debajo de s0)
  while (g(hi) >= 0 && hi > lo) {
    hi *= 0.5
  }

  if (g(hi) >= 0) {
    // No hay raiz no trivial (no deberia ocurrir con R0>1, pero por seguridad)
    return { sInfinity: s0, attackRate: 0 }
  }

  // Ahora g(lo) < 0, g(hi) < 0; necesitamos un punto donde g > 0
  // g(s0) > 0, entonces buscamos entre hi y s0
  // En realidad la estructura es: g(0+) = -inf, g(S_inf) = 0, g(s0) > 0
  // La raiz no trivial es el punto donde g sube de -inf a 0
  // Biseccion: g(lo) = -inf < 0, g(s0) > 0 => raiz en (lo, s0) NO trivial
  // pero hay tambien la raiz trivial en s0.
  // Para biseccion correcta: buscamos en [epsilon, s0 - delta]
  // donde g va de negative a 0 (la raiz no trivial)

  // Reiniciamos: lo donde g<0, hi = s0 (donde g>0)
  lo = 1e-6
  hi = s0 * (1 - 1e-9)

  const maxIter = 300
  for (let iter = 0; iter < maxIter; iter++) {
    const mid = (lo + hi) / 2
    const gMid = g(mid)
    if (gMid < 0) {
      lo = mid // raiz esta a la derecha
    } else if (gMid > 0) {
      hi = mid // raiz esta a la izquierda
    } else {
      lo = mid
      hi = mid
      break
    }
    if (hi - lo < 1e-12) break
  }

  const sInfinity = (lo + hi) / 2
  const attackRate = (s0 - sInfinity) / N
  return { sInfinity, attackRate }
}
