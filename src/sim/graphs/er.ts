/**
 * @fileoverview Generador de grafos aleatorios Erdős–Rényi G(n, p).
 * Utiliza el algoritmo de salto geométrico de Batagelj & Brandes O(n + m)
 * para generación ultrarrápida sin explorar todas las n(n-1)/2 parejas.
 * (SIR-Net Lab — docs/02 §2.3 & T4.1)
 */

import { createRng } from '../../core/rng.ts'
import type { Graph } from './types.ts'

export interface ErParams {
  n: number
  p: number
  seed?: number
}

/**
 * Genera un grafo aleatorio Erdős–Rényi G(n, p).
 *
 * @param params - Parámetros: n (nodos), p (probabilidad de enlace), semilla opcional
 * @returns Estructura de grafo no dirigido
 */
export function generateErdosRenyi(params: ErParams): Graph {
  const { n, p, seed = 42 } = params
  const rng = createRng(seed)

  if (n <= 1) {
    return { n, adj: [new Uint32Array(0)], edges: [] }
  }

  const edges: Array<[number, number]> = []
  const adjLists: number[][] = Array.from({ length: n }, () => [])

  if (p <= 0) {
    const adj = adjLists.map((l) => new Uint32Array(l))
    return { n, adj, edges }
  }

  if (p >= 1) {
    // Grafo completo Kn
    for (let u = 0; u < n; u++) {
      for (let v = u + 1; v < n; v++) {
        edges.push([u, v])
        adjLists[u]?.push(v)
        adjLists[v]?.push(u)
      }
    }
    const adj = adjLists.map((l) => new Uint32Array(l))
    return { n, adj, edges }
  }

  // Algoritmo de salto geométrico:
  // El número de saltos k hasta el siguiente enlace sigue una distribución geométrica:
  // k = floor(ln(1 - U) / ln(1 - p))
  const logP = Math.log(1 - p)
  let v = 1
  let w = -1

  while (v < n) {
    const u = rng()
    // Evitar log(0)
    const safeU = u <= 0 ? 1e-12 : u >= 1 ? 1 - 1e-12 : u
    const jump = Math.floor(Math.log(1 - safeU) / logP)
    w = w + 1 + jump

    while (w >= v && v < n) {
      w = w - v
      v = v + 1
    }

    if (v < n) {
      edges.push([v, w])
      adjLists[v]?.push(w)
      adjLists[w]?.push(v)
    }
  }

  const adj = adjLists.map((l) => new Uint32Array(l))
  return { n, adj, edges }
}
