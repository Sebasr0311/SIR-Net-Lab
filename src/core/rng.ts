/**
 * @fileoverview PRNG con semilla reproducible basado en sfc32.
 * @see docs/02-modelo-matematico.md §2.3
 */

/**
 * Genera un generador de números pseudo-aleatorios usando el algoritmo sfc32
 * (Small Fast Counting, 32 bits). Dada la misma semilla produce siempre
 * la misma secuencia, garantizando reproducibilidad en simulaciones.
 *
 * @param seed - Semilla entera (se trunca a uint32)
 * @returns Función sin argumentos que retorna un flotante en [0, 1)
 * @see docs/02-modelo-matematico.md §2.3
 *
 * @example
 * ```ts
 * const rng = createRng(42)
 * const val = rng() // número en [0, 1)
 * ```
 */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  let b = seed >>> 0
  let c = seed >>> 0
  let d = 1
  return function () {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}
