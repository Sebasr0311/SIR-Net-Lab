/**
 * @fileoverview Generador de redes libres de escala Barabási–Albert (BA).
 * Utiliza el modelo de enlace preferencial lineal (los nodos con mayor grado
 * tienen mayor probabilidad de recibir nuevas conexiones: P(k) ~ k⁻³).
 * (SIR-Net Lab — docs/02 §2.3 & T4.1)
 */

import { createRng } from '../../core/rng.ts'
import type { Graph } from './types.ts'

export interface BaParams {
  n: number
  m: number // número de enlaces por cada nuevo nodo (m >= 1)
  seed?: number
}

/**
 * Genera un grafo libre de escala Barabási–Albert.
 *
 * @param params - Parámetros: n (nodos totales), m (enlaces por nuevo nodo), semilla
 * @returns Estructura de grafo no dirigido
 */
export function generateBarabasiAlbert(params: BaParams): Graph {
  const { n, seed = 42 } = params
  const m = Math.max(1, Math.min(n - 1, params.m))
  const rng = createRng(seed)

  if (n <= 1) {
    return { n, adj: [new Uint32Array(0)], edges: [] }
  }

  const m0 = m + 1 // Tamaño de la semilla inicial
  const edges: Array<[number, number]> = []
  const adjLists: number[][] = Array.from({ length: n }, () => [])

  // Arreglo repetido para muestreo preferencial O(1):
  // Cada nodo i aparece k_i veces en el arreglo.
  const repeatedNodes: number[] = []

  // 1. Núcleo inicial completo de m0 nodos
  for (let i = 0; i < m0; i++) {
    for (let j = i + 1; j < m0; j++) {
      edges.push([i, j])
      adjLists[i]?.push(j)
      adjLists[j]?.push(i)
      repeatedNodes.push(i, j)
    }
  }

  // 2. Crecimiento con enlace preferencial
  for (let v = m0; v < n; v++) {
    const targets = new Set<number>()

    while (targets.size < m) {
      const randIdx = Math.floor(rng() * repeatedNodes.length)
      const target = repeatedNodes[randIdx]
      if (target !== undefined && target !== v) {
        targets.add(target)
      }
    }

    targets.forEach((target) => {
      edges.push([v, target])
      adjLists[v]?.push(target)
      adjLists[target]?.push(v)

      repeatedNodes.push(v, target)
    })
  }

  // 3. Convertir a Uint32Array
  const adj: Uint32Array[] = adjLists.map((list) => {
    list.sort((a, b) => a - b)
    return new Uint32Array(list)
  })

  return { n, adj, edges }
}
