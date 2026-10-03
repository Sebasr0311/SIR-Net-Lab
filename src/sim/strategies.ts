/**
 * @fileoverview Estrategias de inmunización y control en redes complejas (SIR-Net Lab).
 * Implementa estrategias de contención de malware:
 * - Ninguna (referencia / baseline)
 * - Inmunización aleatoria (Random Immunization)
 * - Inmunización dirigida a hubs (Targeted Hubs / Mayor grado)
 * - Inmunización por conocidos / vecinos (Acquaintance Immunization - Cohen et al. 2003)
 *
 * @see docs/02-modelo-matematico.md §2.3
 * @see docs/06-plan-de-trabajo.md T5.2 & T5.3
 */

import { createRng } from '../core/rng.ts'
import type { Graph } from './graphs/types.ts'
import { simulateGillespie, type GillespieResult } from './gillespie.ts'

export type ImmunizationStrategy = 'none' | 'random' | 'hubs' | 'acquaintance'

export interface StrategyResult {
  strategy: ImmunizationStrategy
  name: string
  description: string
  immunizedNodes: number[]
  immunizedCount: number
  outbreakInfected: number
  attackRate: number
  peakI: number
  peakTime: number
  duration: number
  reductionPercent: number
  t: Float64Array
  S: Float64Array
  I: Float64Array
  R: Float64Array
}

export interface EvaluateStrategiesOptions {
  graph: Graph
  budgetCount?: number
  budgetFraction?: number
  beta: number
  gamma: number
  sigma?: number
  i0?: number
  seed?: number
  tMax?: number
  dt?: number
  strategies?: ImmunizationStrategy[]
}

export interface StrategyEvaluationReport {
  results: Record<ImmunizationStrategy, StrategyResult>
  budget: number
  budgetFraction: number
  summary: string
}

/**
 * Selecciona nodos al azar de forma uniforme sin repetición.
 */
export function selectRandomNodes(
  n: number,
  budgetCount: number,
  rng: () => number,
  exclude?: Set<number>
): number[] {
  const candidates: number[] = []
  for (let i = 0; i < n; i++) {
    if (!exclude || !exclude.has(i)) {
      candidates.push(i)
    }
  }

  const count = Math.min(candidates.length, Math.max(0, budgetCount))
  const selected: number[] = []

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (candidates.length - i))
    const temp = candidates[i] ?? 0
    candidates[i] = candidates[j] ?? 0
    candidates[j] = temp
    selected.push(candidates[i] ?? 0)
  }

  return selected
}

/**
 * Selecciona los nodos con mayor grado (hubs) de la red.
 * Requiere conocimiento topológico global.
 */
export function selectHubNodes(graph: Graph, budgetCount: number, exclude?: Set<number>): number[] {
  const { n, adj } = graph
  const nodesWithDegree: Array<{ id: number; degree: number }> = []

  for (let i = 0; i < n; i++) {
    if (!exclude || !exclude.has(i)) {
      nodesWithDegree.push({
        id: i,
        degree: adj[i]?.length ?? 0,
      })
    }
  }

  // Ordenar de mayor a menor grado
  nodesWithDegree.sort((a, b) => b.degree - a.degree || a.id - b.id)

  const count = Math.min(nodesWithDegree.length, Math.max(0, budgetCount))
  return nodesWithDegree.slice(0, count).map((item) => item.id)
}

/**
 * Inmunización por conocidos / vecinos (Acquaintance Immunization).
 *
 * Algoritmo:
 * Elige un nodo al azar y luego elige uno de sus vecinos al azar para inmunizarlo.
 * Por la "paradoja de la amistad" (Friendship Paradox), el grado promedio de un
 * vecino es ⟨k²⟩/⟨k⟩ > ⟨k⟩. En redes heterogéneas (scale-free), esto selecciona
 * preferencialmente a los hubs SIN necesidad de conocer la topología global.
 *
 * @see Cohen, R., Havlin, S., & ben-Avraham, D. (2003). Efficient immunization strategies.
 */
export function selectAcquaintanceNodes(
  graph: Graph,
  budgetCount: number,
  rng: () => number,
  exclude?: Set<number>
): number[] {
  const { n, adj } = graph
  if (n === 0 || budgetCount <= 0) return []

  const selectedSet = new Set<number>()
  const targetCount = Math.min(n, budgetCount)

  // Nodos con al menos un vecino válido
  const validSeeds: number[] = []
  for (let i = 0; i < n; i++) {
    if ((adj[i]?.length ?? 0) > 0) {
      validSeeds.push(i)
    }
  }

  if (validSeeds.length === 0) {
    return selectRandomNodes(n, budgetCount, rng, exclude)
  }

  const maxAttempts = targetCount * 100
  let attempts = 0

  while (selectedSet.size < targetCount && attempts < maxAttempts) {
    attempts++
    // 1. Elegir nodo al azar
    const seedIdx = Math.floor(rng() * validSeeds.length)
    const randomNode = validSeeds[seedIdx] ?? 0
    const neighbors = adj[randomNode]

    if (neighbors && neighbors.length > 0) {
      // 2. Elegir un vecino al azar de ese nodo
      const neighborIdx = Math.floor(rng() * neighbors.length)
      const targetNeighbor = neighbors[neighborIdx]

      if (
        targetNeighbor !== undefined &&
        !selectedSet.has(targetNeighbor) &&
        (!exclude || !exclude.has(targetNeighbor))
      ) {
        selectedSet.add(targetNeighbor)
      }
    }
  }

  // Si por desconexión no se completó el presupuesto, rellenar con aleatorios
  if (selectedSet.size < targetCount) {
    const filler = selectRandomNodes(
      n,
      targetCount - selectedSet.size,
      rng,
      new Set([...(exclude ? Array.from(exclude) : []), ...Array.from(selectedSet)])
    )
    filler.forEach((node) => selectedSet.add(node))
  }

  return Array.from(selectedSet)
}

/**
 * Evalúa y compara las estrategias de inmunización bajo un mismo presupuesto y semillas pareadas.
 */
export function evaluateStrategies(opts: EvaluateStrategiesOptions): StrategyEvaluationReport {
  const {
    graph,
    budgetCount,
    budgetFraction = 0.1,
    beta,
    gamma,
    sigma = 0,
    i0 = 1,
    seed = 42,
    tMax = 60,
    dt = 0.2,
    strategies = ['none', 'random', 'hubs', 'acquaintance'],
  } = opts

  const n = graph.n
  const actualBudget =
    budgetCount !== undefined
      ? Math.min(n, Math.max(0, budgetCount))
      : Math.min(n, Math.max(0, Math.round(n * budgetFraction)))

  const actualFraction = n > 0 ? actualBudget / n : 0

  // PRNG determinista para selección de nodos de cada estrategia
  const rngSelect = createRng(seed + 101)

  const meta: Record<
    ImmunizationStrategy,
    { name: string; description: string; getNodes: () => number[] }
  > = {
    none: {
      name: 'Sin intervención',
      description: 'Laissez-faire: propagación epidémica natural sin medidas de defensa.',
      getNodes: () => [],
    },
    random: {
      name: 'Inmunización aleatoria',
      description: 'Parcheo uniforme de equipos sin priorización topológica.',
      getNodes: () => selectRandomNodes(n, actualBudget, rngSelect),
    },
    hubs: {
      name: 'Dirigida a hubs (grado)',
      description: 'Parcheo selectivo de los nodos con mayor grado de conectividad.',
      getNodes: () => selectHubNodes(graph, actualBudget),
    },
    acquaintance: {
      name: 'Muestreo de vecinos',
      description: 'Inmunización por conocidos (Friendship Paradox): selecciona vecinos al azar.',
      getNodes: () => selectAcquaintanceNodes(graph, actualBudget, rngSelect),
    },
  }

  const results: Partial<Record<ImmunizationStrategy, StrategyResult>> = {}

  // 1. Simulación base 'none' primero si está habilitada, para calcular reducciones relativas
  // Corremos primero 'none' para establecer referencia
  const simBase = simulateGillespie({
    graph,
    beta,
    gamma,
    sigma,
    i0,
    seed,
    tMax,
    dt,
    initialRemoved: [],
  })
  const baselineInfected = simBase.totalInfected

  for (const strat of strategies) {
    const info = meta[strat]
    const immunizedNodes = info.getNodes()

    let sim: GillespieResult
    if (strat === 'none') {
      sim = simBase
    } else {
      // Usar exactamente la misma semilla del brote para comparabilidad estricta
      sim = simulateGillespie({
        graph,
        beta,
        gamma,
        sigma,
        i0,
        seed,
        tMax,
        dt,
        initialRemoved: immunizedNodes,
      })
    }

    // Calcular pico y tiempo de pico
    let peakI = 0
    let peakTime = 0
    for (let i = 0; i < sim.I.length; i++) {
      if ((sim.I[i] ?? 0) > peakI) {
        peakI = sim.I[i] ?? 0
        peakTime = sim.t[i] ?? 0
      }
    }

    const outbreakInfected = sim.totalInfected
    const nonImmunized = Math.max(1, n - immunizedNodes.length)
    const attackRate = outbreakInfected / nonImmunized
    const reductionPercent =
      baselineInfected > 0
        ? Math.max(0, ((baselineInfected - outbreakInfected) / baselineInfected) * 100)
        : 0

    results[strat] = {
      strategy: strat,
      name: info.name,
      description: info.description,
      immunizedNodes,
      immunizedCount: immunizedNodes.length,
      outbreakInfected,
      attackRate,
      peakI,
      peakTime,
      duration: sim.duration,
      reductionPercent,
      t: sim.t,
      S: sim.S,
      I: sim.I,
      R: sim.R,
    }
  }

  // Resumen sintético comparativo
  const hubsInfected = results.hubs?.outbreakInfected ?? baselineInfected
  const randInfected = results.random?.outbreakInfected ?? baselineInfected
  const summary =
    hubsInfected < randInfected
      ? `La estrategia dirigida a hubs evitó ${randInfected - hubsInfected} infecciones adicionales frente al parcheo aleatorio con el mismo presupuesto (${actualBudget} nodos, ${(actualFraction * 100).toFixed(1)}%).`
      : `Las estrategias lograron contener la propagación con ${actualBudget} nodos inmunizados.`

  return {
    results: results as Record<ImmunizationStrategy, StrategyResult>,
    budget: actualBudget,
    budgetFraction: actualFraction,
    summary,
  }
}
