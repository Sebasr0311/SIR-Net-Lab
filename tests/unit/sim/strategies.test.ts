import { describe, it, expect } from 'vitest'
import { generateBarabasiAlbert } from '../../../src/sim/graphs/ba.ts'
import { generateErdosRenyi } from '../../../src/sim/graphs/er.ts'
import { createRng } from '../../../src/core/rng.ts'
import {
  selectRandomNodes,
  selectHubNodes,
  selectAcquaintanceNodes,
  evaluateStrategies,
} from '../../../src/sim/strategies.ts'

describe('Estrategias de inmunización en red (T5.2, T5.3)', () => {
  it('selectRandomNodes selecciona la cantidad exacta sin repetición ni excluidos', () => {
    const rng = createRng(42)
    const n = 100
    const exclude = new Set([0, 1, 2, 3, 4])
    const selected = selectRandomNodes(n, 10, rng, exclude)

    expect(selected.length).toBe(10)
    const unique = new Set(selected)
    expect(unique.size).toBe(10)

    selected.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(0)
      expect(id).toBeLessThan(n)
      expect(exclude.has(id)).toBe(false)
    })
  })

  it('selectHubNodes prioriza estrictamente los nodos con mayor grado', () => {
    const graph = generateBarabasiAlbert({ n: 50, m: 2, seed: 42 })
    const selected = selectHubNodes(graph, 5)

    expect(selected.length).toBe(5)
    // El grado de cada seleccionado debe ser >= que el del siguiente
    for (let i = 0; i < selected.length - 1; i++) {
      const u = selected[i] ?? 0
      const v = selected[i + 1] ?? 0
      const degU = graph.adj[u]?.length ?? 0
      const degV = graph.adj[v]?.length ?? 0
      expect(degU).toBeGreaterThanOrEqual(degV)
    }

    // El primer nodo seleccionado debe ser el de grado máximo global
    const maxDegree = Math.max(...graph.adj.map((neighbors) => neighbors.length))
    const firstSelected = selected[0] ?? 0
    expect(graph.adj[firstSelected]?.length).toBe(maxDegree)
  })

  it('selectAcquaintanceNodes selecciona vecinos válidos sin duplicados', () => {
    const graph = generateErdosRenyi({ n: 80, p: 0.1, seed: 42 })
    const rng = createRng(123)
    const selected = selectAcquaintanceNodes(graph, 8, rng)

    expect(selected.length).toBe(8)
    const unique = new Set(selected)
    expect(unique.size).toBe(8)
    selected.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(0)
      expect(id).toBeLessThan(80)
    })
  })

  it('en red libre de escala (Barabási-Albert), la estrategia de hubs reduce el tamaño final significativamente más que la aleatoria (T5.2 CA)', () => {
    // Red Barabási-Albert heterogénea
    const graph = generateBarabasiAlbert({ n: 300, m: 3, seed: 42 })
    const budgetFraction = 0.15 // 15% de inmunización

    const report = evaluateStrategies({
      graph,
      budgetFraction,
      beta: 0.6,
      gamma: 0.2,
      i0: 2,
      seed: 42,
      tMax: 50,
      dt: 0.2,
    })

    const { none, random, hubs, acquaintance } = report.results

    expect(none).toBeDefined()
    expect(random).toBeDefined()
    expect(hubs).toBeDefined()
    expect(acquaintance).toBeDefined()

    // Ambas intervenciones reducen o igualan las infecciones frente a ninguna intervención
    expect(random.outbreakInfected).toBeLessThanOrEqual(none.outbreakInfected)
    expect(hubs.outbreakInfected).toBeLessThanOrEqual(none.outbreakInfected)

    // CA T5.2: En Barabási-Albert, Hubs supera a aleatorio
    expect(hubs.outbreakInfected).toBeLessThan(random.outbreakInfected)
    expect(hubs.reductionPercent).toBeGreaterThan(random.reductionPercent)
    expect(report.summary).toContain('evitó')
  })

  it('produce resultados reproducibles idénticos bit a bit con la misma semilla', () => {
    const graph = generateBarabasiAlbert({ n: 100, m: 2, seed: 77 })
    const report1 = evaluateStrategies({
      graph,
      budgetFraction: 0.1,
      beta: 0.5,
      gamma: 0.2,
      seed: 999,
    })
    const report2 = evaluateStrategies({
      graph,
      budgetFraction: 0.1,
      beta: 0.5,
      gamma: 0.2,
      seed: 999,
    })

    expect(report1.results.hubs.outbreakInfected).toBe(report2.results.hubs.outbreakInfected)
    expect(report1.results.random.outbreakInfected).toBe(report2.results.random.outbreakInfected)
    expect(report1.results.hubs.peakI).toBe(report2.results.hubs.peakI)
  })
})
