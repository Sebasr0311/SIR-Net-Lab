/**
 * @fileoverview Estabilidad del equilibrio libre de infeccion y Jacobiano del SIR.
 * @see docs/02-modelo-matematico.md #seccion-2.6
 */

import type { Params } from '../models/types.ts'

/**
 * Analiza la estabilidad del equilibrio libre de infeccion (I-star = 0).
 *
 * El autovalor de la perturbacion en I es:
 * eigenvalue = beta * S-star / N - gamma
 *
 * Si eigenvalue menor que 0 el equilibrio es estable (R_ef menor que 1).
 * Si eigenvalue mayor que 0 el equilibrio es inestable (R_ef mayor que 1).
 *
 * @param p - Parametros del modelo
 * @returns Objeto con eigenvalue y stable (boolean)
 * @see docs/02-modelo-matematico.md #seccion-2.6
 */
export function equilibriumStability(p: Params): { eigenvalue: number; stable: boolean } {
  const { N, beta, gamma } = p
  // En el equilibrio libre de infeccion, S-star = N (sin vacunacion previa)
  const eigenvalue = (beta * N) / N - gamma // = beta - gamma = gamma*(R0-1)
  return { eigenvalue, stable: eigenvalue < 0 }
}

/**
 * Calcula los autovalores del Jacobiano 2x2 del SIR linealizado en (S-star, 0).
 *
 * La matriz J evaluada en I-star=0:
 *   J[0][0] = 0,               J[0][1] = -beta * S-star / N
 *   J[1][0] = 0,               J[1][1] =  beta * S-star / N - gamma
 *
 * Los autovalores son lambda1 = 0, lambda2 = beta * S-star/N - gamma.
 *
 * @param p      - Parametros del modelo
 * @param sStar  - Susceptibles en el punto de equilibrio
 * @returns Tupla [lambda1, lambda2] con lambda1 = 0 siempre
 * @see docs/02-modelo-matematico.md #seccion-2.6
 */
export function jacobianEigenvalues(p: Params, sStar: number): [number, number] {
  const { N, beta, gamma } = p
  const lambda2 = (beta * sStar) / N - gamma
  return [0, lambda2]
}
