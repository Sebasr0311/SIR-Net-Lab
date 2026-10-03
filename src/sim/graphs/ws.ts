/**
 * @fileoverview Generador de grafos de mundo pequeño Watts–Strogatz (Small-World).
 * Inicia con una red regular en anillo donde cada nodo se conecta a k vecinos,
 * y reconecta cada arista con probabilidad p hacia un nodo aleatorio.
 * (SIR-Net Lab — docs/02 §2.3 & T4.1)
 */

import { createRng } from '../../core/rng.ts'
import type { Graph } from './types.ts'

export interface WsParams {
  n: number
  k: number // grado inicial regular (par)
  p: number // probabilidad de reconexión [0, 1]
  seed?: number
}

/**
 * Genera un grafo de mundo pequeño Watts–Strogatz.
 *
 * @param params - Parámetros: n (nodos), k (grado base par), p (reconexión), semilla
 * @returns Estructura de grafo no dirigido
 */
export function generateWattsStrogatz(params: WsParams): Graph {
  const { n, p, seed = 42 } = params
  // Asegurar que k sea par y menor que n
  const k = Math.min(n - 1, Math.max(2, params.k % 2 === 0 ? params.k : params.k - 1))
  const rng = createRng(seed)

  if (n <= 1) {
    return { n, adj: [new Uint32Array(0)], edges: [] }
  }

  // Conjuntos de adyacencia para evitar enlaces duplicados rápidamente
  const neighborSets: Array<Set<number>> = Array.from({ length: n }, () => new Set<number>())

  const halfK = Math.floor(k / 2)

  // 1. Crear anillo regular de k vecinos (halfK a cada lado)
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= halfK; j++) {
      const neighbor = (i + j) % n
      neighborSets[i]?.add(neighbor)
      neighborSets[neighbor]?.add(i)
    }
  }

  // 2. Reconexión aleatoria con probabilidad p
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= halfK; j++) {
      if (rng() < p) {
        const oldTarget = (i + j) % n
        if (!neighborSets[i]?.has(oldTarget)) continue

        // Buscar nuevo objetivo w distinto de i y no conectado actualmente
        // Intentar hasta 100 veces
        let candidate = -1
        for (let tries = 0; tries < 100; tries++) {
          const w = Math.floor(rng() * n)
          if (w !== i && !neighborSets[i]?.has(w)) {
            candidate = w
            break
          }
        }

        if (candidate !== -1) {
          // Remover arista anterior
          neighborSets[i]?.delete(oldTarget)
          neighborSets[oldTarget]?.delete(i)

          // Agregar nueva arista
          neighborSets[i]?.add(candidate)
          neighborSets[candidate]?.add(i)
        }
      }
    }
  }

  // 3. Extraer aristas únicas y construir Uint32Array de adyacencia
  const edges: Array<[number, number]> = []
  const adj: Uint32Array[] = new Array<Uint32Array>(n)

  for (let u = 0; u < n; u++) {
    const neighbors = Array.from(neighborSets[u] ?? []).sort((a, b) => a - b)
    adj[u] = new Uint32Array(neighbors)

    neighbors.forEach((v) => {
      if (u < v) {
        edges.push([u, v])
      }
    })
  }

  return { n, adj, edges }
}
