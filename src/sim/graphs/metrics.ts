/**
 * @fileoverview Cálculo de métricas topológicas y umbrales epidémicos en redes.
 * (SIR-Net Lab — docs/02 §2.3, RF-08 & T4.1, T4.6)
 */

import type { Graph, NetworkMetrics, DegreeBin } from './types.ts'

/**
 * Calcula todas las métricas topológicas y umbrales epidémicos para un grafo dado.
 *
 * @param graph - Grafo no dirigido
 * @param beta  - Tasa de transmisión (por defecto 0.6)
 * @param gamma - Tasa de recuperación (por defecto 0.2)
 * @returns {@link NetworkMetrics}
 */
export function computeNetworkMetrics(graph: Graph, beta = 0.6, gamma = 0.2): NetworkMetrics {
  const { n, adj } = graph

  if (n === 0) {
    return {
      meanDegree: 0,
      secondMoment: 0,
      heterogeneity: 0,
      lambdaC: 0,
      tc: 0,
      r0Effective: 0,
      degreeDistribution: [],
    }
  }

  let sumK = 0
  let sumK2 = 0
  const degreeCounts = new Map<number, number>()

  for (let i = 0; i < n; i++) {
    const k = adj[i]?.length ?? 0
    sumK += k
    sumK2 += k * k
    degreeCounts.set(k, (degreeCounts.get(k) ?? 0) + 1)
  }

  const meanDegree = sumK / n
  const secondMoment = sumK2 / n
  const heterogeneity = meanDegree > 0 ? secondMoment / meanDegree : 0

  // Umbral SIS heterogéneo (Pastor-Satorras & Vespignani)
  const lambdaC = secondMoment > 0 ? meanDegree / secondMoment : 0

  // Transmisibilidad crítica SIR: T_c = ⟨k⟩ / (⟨k²⟩ - ⟨k⟩)
  const varianceExcess = secondMoment - meanDegree
  const tc = varianceExcess > 0 ? meanDegree / varianceExcess : 0

  // Transmisibilidad por arista T = β / (β + γ)
  const T = beta + gamma > 0 ? beta / (beta + gamma) : 0
  // R₀ efectivo en red ≈ T · (⟨k²⟩ - ⟨k⟩) / ⟨k⟩
  const r0Effective = meanDegree > 0 ? (T * varianceExcess) / meanDegree : 0

  // Construir histograma ordenado
  const sortedDegrees = Array.from(degreeCounts.keys()).sort((a, b) => a - b)
  const degreeDistribution: DegreeBin[] = sortedDegrees.map((deg) => {
    const count = degreeCounts.get(deg) ?? 0
    return {
      degree: deg,
      count,
      fraction: count / n,
    }
  })

  return {
    meanDegree,
    secondMoment,
    heterogeneity,
    lambdaC,
    tc,
    r0Effective,
    degreeDistribution,
  }
}
