import { describe, it, expect } from 'vitest'
import { generateErdosRenyi } from '../../../src/sim/graphs/er.ts'
import { simulateGillespie } from '../../../src/sim/gillespie.ts'
import { sirRhs } from '../../../src/core/models/sir.ts'
import { rk4 } from '../../../src/core/solvers/rk4.ts'

describe('Simulación estocástica de Gillespie sobre grafos (T4.2)', () => {
  it('conserva estrictamente la población total S + I + R = N', () => {
    const n = 150
    const graph = generateErdosRenyi({ n, p: 0.08, seed: 42 })

    const res = simulateGillespie({
      graph,
      beta: 0.6,
      gamma: 0.2,
      i0: 3,
      tMax: 40,
      dt: 0.2,
      seed: 99,
    })

    expect(res.t.length).toBeGreaterThan(10)

    for (let i = 0; i < res.t.length; i++) {
      const s = res.S[i] ?? 0
      const inf = res.I[i] ?? 0
      const r = res.R[i] ?? 0
      expect(s + inf + r).toBe(n)
    }
  })

  it('el modelo SEIR conserva S + E + I + R = N y exhibe fase latente', () => {
    const n = 100
    const graph = generateErdosRenyi({ n, p: 0.1, seed: 10 })

    const res = simulateGillespie({
      graph,
      beta: 0.8,
      gamma: 0.2,
      sigma: 0.5,
      i0: 2,
      tMax: 30,
      dt: 0.2,
      seed: 77,
    })

    expect(res.E).toBeDefined()
    if (res.E) {
      for (let i = 0; i < res.t.length; i++) {
        const s = res.S[i] ?? 0
        const e = res.E[i] ?? 0
        const inf = res.I[i] ?? 0
        const r = res.R[i] ?? 0
        expect(s + e + inf + r).toBe(n)
      }

      const maxE = Math.max(...Array.from(res.E))
      expect(maxE).toBeGreaterThan(0)
    }
  })

  it('es exactamente reproducible bit a bit con la misma semilla', () => {
    const graph = generateErdosRenyi({ n: 80, p: 0.08, seed: 42 })

    const res1 = simulateGillespie({
      graph,
      beta: 0.6,
      gamma: 0.2,
      i0: 2,
      tMax: 30,
      dt: 0.5,
      seed: 12345,
    })

    const res2 = simulateGillespie({
      graph,
      beta: 0.6,
      gamma: 0.2,
      i0: 2,
      tMax: 30,
      dt: 0.5,
      seed: 12345,
    })

    expect(Array.from(res1.I)).toEqual(Array.from(res2.I))
    expect(Array.from(res1.S)).toEqual(Array.from(res2.S))
    expect(Array.from(res1.R)).toEqual(Array.from(res2.R))
  })

  it('en un grafo completo K_N y N grande coincide con la EDO (RMSE normalizado < 3%)', () => {
    const n = 400
    const beta = 0.6
    const gamma = 0.2
    const i0 = 5
    const tMax = 35
    const dt = 0.2
    const mRuns = 20

    // Grafo completo Kn (p = 1)
    const completeGraph = generateErdosRenyi({ n, p: 1, seed: 42 })

    // Resolver EDO continua homogénea
    const s0 = n - i0
    const rhs = sirRhs({ N: n, beta, gamma, i0 })
    const odeRes = rk4(rhs, new Float64Array([s0, i0, 0]), 0, tMax, { dt })

    // Promedio de M simulaciones de Gillespie
    const numSteps = odeRes.t.length
    const iAccum = new Float64Array(numSteps)

    for (let run = 0; run < mRuns; run++) {
      const gRes = simulateGillespie({
        graph: completeGraph,
        beta,
        gamma,
        i0,
        tMax,
        dt,
        seed: 1000 + run * 37,
      })

      for (let step = 0; step < numSteps; step++) {
        iAccum[step] += gRes.I[step] ?? 0
      }
    }

    const meanI = Array.from(iAccum).map((val) => val / mRuns)

    // Calcular RMSE normalizado por N: sqrt( mean( (I_gillespie - I_ode)^2 ) ) / N
    let sumSq = 0
    for (let step = 0; step < numSteps; step++) {
      const diff = (meanI[step] ?? 0) - (odeRes.I[step] ?? 0)
      sumSq += diff * diff
    }
    const rmse = Math.sqrt(sumSq / numSteps)
    const normalizedRmse = rmse / n

    // Criterio de aceptación T4.2: RMSE normalizado < 3 % (0.03)
    expect(normalizedRmse).toBeLessThan(0.03)
  })
})
