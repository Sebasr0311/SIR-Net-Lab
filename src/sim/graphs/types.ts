/**
 * @fileoverview Definiciones de tipos para grafos y métricas topológicas de red.
 * (SIR-Net Lab — docs/02 §2.3 & docs/04)
 */

/**
 * Estructura de grafo optimizada en memoria.
 * `adj[i]` contiene los índices de los vecinos del nodo `i` en un Uint32Array.
 */
export interface Graph {
  /** Número total de nodos en la red. */
  n: number
  /** Lista de adyacencia indexada por ID de nodo. */
  adj: Uint32Array[]
  /** Lista de aristas no dirigidas [origen, destino]. */
  edges: Array<[number, number]>
}

/** Distribución de grado para un valor k. */
export interface DegreeBin {
  degree: number
  count: number
  fraction: number
}

/** Métricas topológicas calculadas del grafo. */
export interface NetworkMetrics {
  /** Grado medio ⟨k⟩ */
  meanDegree: number
  /** Segundo momento del grado ⟨k²⟩ */
  secondMoment: number
  /** Heterogeneidad de grado ⟨k²⟩ / ⟨k⟩ */
  heterogeneity: number
  /** Umbral epidémico SIS heterogéneo: λ_c = ⟨k⟩ / ⟨k²⟩ */
  lambdaC: number
  /** Transmisibilidad crítica SIR: T_c = ⟨k⟩ / (⟨k²⟩ - ⟨k⟩) */
  tc: number
  /** R₀ efectivo en la red: (β / (β + γ)) · (⟨k²⟩ - ⟨k⟩) / ⟨k⟩ */
  r0Effective: number
  /** Distribución de grados observada */
  degreeDistribution: DegreeBin[]
}
