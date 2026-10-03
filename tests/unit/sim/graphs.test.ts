import { describe, it, expect } from 'vitest'
import { generateErdosRenyi } from '../../../src/sim/graphs/er.ts'
import { generateWattsStrogatz } from '../../../src/sim/graphs/ws.ts'
import { generateBarabasiAlbert } from '../../../src/sim/graphs/ba.ts'
import { computeNetworkMetrics } from '../../../src/sim/graphs/metrics.ts'

describe('Generadores de topologías y métricas de red (T4.1)', () => {
  describe('Erdős–Rényi G(n, p)', () => {
    it('genera un grafo completo K_n cuando p = 1', () => {
      const n = 20
      const graph = generateErdosRenyi({ n, p: 1, seed: 123 })

      expect(graph.n).toBe(n)
      expect(graph.edges.length).toBe((n * (n - 1)) / 2)

      for (let i = 0; i < n; i++) {
        expect(graph.adj[i]?.length).toBe(n - 1)
      }
    })

    it('el grado medio está cerca de p*(n-1) en grafos grandes', () => {
      const n = 1000
      const p = 0.01 // esperado: ⟨k⟩ ≈ 10
      const graph = generateErdosRenyi({ n, p, seed: 42 })
      const metrics = computeNetworkMetrics(graph)

      expect(metrics.meanDegree).toBeGreaterThan(8.5)
      expect(metrics.meanDegree).toBeLessThan(11.5)
    })

    it('es simétrico y no dirigido', () => {
      const graph = generateErdosRenyi({ n: 50, p: 0.1, seed: 99 })
      for (let u = 0; u < graph.n; u++) {
        const neighbors = graph.adj[u]
        if (neighbors) {
          for (let i = 0; i < neighbors.length; i++) {
            const v = neighbors[i]
            if (v !== undefined) {
              const vNeighbors = Array.from(graph.adj[v] ?? [])
              expect(vNeighbors).toContain(u)
            }
          }
        }
      }
    })
  })

  describe('Watts–Strogatz (Small-World)', () => {
    it('con p = 0 genera un anillo regular con grado exactamente k', () => {
      const n = 100
      const k = 4
      const graph = generateWattsStrogatz({ n, k, p: 0, seed: 42 })
      const metrics = computeNetworkMetrics(graph)

      expect(graph.edges.length).toBe((n * k) / 2)
      expect(metrics.meanDegree).toBe(k)

      for (let i = 0; i < n; i++) {
        expect(graph.adj[i]?.length).toBe(k)
      }
    })

    it('con p > 0 conserva la cantidad total de aristas y el grado medio', () => {
      const n = 200
      const k = 6
      const graph = generateWattsStrogatz({ n, k, p: 0.2, seed: 42 })
      const metrics = computeNetworkMetrics(graph)

      expect(graph.edges.length).toBe((n * k) / 2)
      expect(metrics.meanDegree).toBe(k)
    })
  })

  describe('Barabási–Albert (Scale-Free)', () => {
    it('genera red libre de escala con grado mínimo m', () => {
      const n = 500
      const m = 3
      const graph = generateBarabasiAlbert({ n, m, seed: 42 })
      const metrics = computeNetworkMetrics(graph)

      expect(graph.n).toBe(n)
      // Cada nuevo nodo agrega exactamente m aristas
      const m0 = m + 1
      const initialEdges = (m0 * (m0 - 1)) / 2
      const addedEdges = (n - m0) * m
      expect(graph.edges.length).toBe(initialEdges + addedEdges)

      // Grado mínimo m
      for (let i = m0; i < n; i++) {
        expect(graph.adj[i]?.length).toBeGreaterThanOrEqual(m)
      }

      // Presencia de hubs: el grado máximo debe ser muy superior a la media
      let maxDegree = 0
      for (let i = 0; i < n; i++) {
        maxDegree = Math.max(maxDegree, graph.adj[i]?.length ?? 0)
      }
      expect(maxDegree).toBeGreaterThan(metrics.meanDegree * 3)
      expect(metrics.secondMoment).toBeGreaterThan(metrics.meanDegree * metrics.meanDegree)
    })
  })

  describe('Métricas de red y umbrales (T4.6)', () => {
    it('calcula métricas de heterogeneidad y umbral crítico correctamente', () => {
      const graph = generateBarabasiAlbert({ n: 300, m: 2, seed: 42 })
      const metrics = computeNetworkMetrics(graph, 0.6, 0.2)

      expect(metrics.meanDegree).toBeGreaterThan(0)
      expect(metrics.secondMoment).toBeGreaterThan(metrics.meanDegree)
      expect(metrics.lambdaC).toBeCloseTo(metrics.meanDegree / metrics.secondMoment)
      expect(metrics.r0Effective).toBeGreaterThan(0)
      expect(metrics.degreeDistribution.length).toBeGreaterThan(0)
    })
  })
})
