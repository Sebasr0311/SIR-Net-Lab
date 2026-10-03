/**
 * @fileoverview Generador de Muestras por Hipercubo Latino (Latin Hypercube Sampling - LHS).
 * Garantiza un muestreo estratificado multi-dimensional uniforme y no sesgado en el espacio de parámetros.
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.3
 */

import { createRng } from '../rng.ts'

export interface ParameterRange {
  name: string
  min: number
  max: number
}

/**
 * Genera N muestras estratificadas en k dimensiones mediante Latin Hypercube Sampling.
 * @param ranges Rangos de cada parámetro [min, max]
 * @param nSamples Número de muestras a generar M
 * @param seed Semilla reproducible
 */
export function generateLhsSamples(
  ranges: ParameterRange[],
  nSamples: number,
  seed: number = 42
): Array<Record<string, number>> {
  const rng = createRng(seed)
  const nParams = ranges.length
  if (nSamples <= 0 || nParams === 0) return []

  // Matriz de estratos permutados [paramIdx][sampleIdx]
  const strataIndices: number[][] = []

  for (let p = 0; p < nParams; p++) {
    // Array con índices 0 ... nSamples - 1
    const perm: number[] = Array.from({ length: nSamples }, (_, i) => i)

    // Permutación de Fisher-Yates usando el PRNG sfc32
    for (let i = nSamples - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      const temp = perm[i]!
      perm[i] = perm[j]!
      perm[j] = temp
    }
    strataIndices.push(perm)
  }

  const samples: Array<Record<string, number>> = []

  for (let s = 0; s < nSamples; s++) {
    const sampleRecord: Record<string, number> = {}

    for (let p = 0; p < nParams; p++) {
      const param = ranges[p]!
      const stratum = strataIndices[p]![s]!

      // Posición dentro del estrato: (stratum + u) / nSamples, u ~ U(0, 1)
      const u = rng()
      const normalizedVal = (stratum + u) / nSamples
      const actualVal = param.min + normalizedVal * (param.max - param.min)

      sampleRecord[param.name] = actualVal
    }

    samples.push(sampleRecord)
  }

  return samples
}
