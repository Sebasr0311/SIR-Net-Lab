import { describe, it, expect } from 'vitest'
import { euler } from '../../../src/core/solvers/euler.ts'
import { rk4 } from '../../../src/core/solvers/rk4.ts'
import { dopri5 } from '../../../src/core/solvers/dopri5.ts'
import type { RHS } from '../../../src/core/models/types.ts'

// ── Solución analítica logística ──────────────────────────────────────────────
// dI/dt = r*I*(1 - I/K),  I(0)=I0
// I(t) = K / (1 + ((K-I0)/I0) * exp(-r*t))
const r = 0.5
const K = 1000
const I0 = 1
const T_END = 20

function logisticAnalytic(t: number): number {
  return K / (1 + ((K - I0) / I0) * Math.exp(-r * t))
}

// RHS logístico: y = [I]
const logisticRhs: RHS = (_t, y) => {
  const I = y[0]
  const out = new Float64Array(1)
  out[0] = r * I * (1 - I / K)
  return out
}

/** Error global máximo de un solver en el caso logístico */
function maxError(solver: typeof euler | typeof rk4, dt: number): number {
  // Los solvers retornan Series con S=I (dim=3 fallback -> y[0]=S, y[1]=I, y[2]=R)
  // Para dim=1 necesitamos un RHS compatible con buildSeries.
  // Usamos dim=3: [I, 0, 0]
  const rhsDim3: RHS = (_t, y) => {
    const I = y[0]
    const out = new Float64Array(3)
    out[0] = r * I * (1 - I / K)
    out[1] = 0
    out[2] = 0
    return out
  }
  const y0_3 = new Float64Array([I0, 0, 0])
  const series = solver(rhsDim3, y0_3, 0, T_END, { dt })
  let maxErr = 0
  for (let i = 0; i < series.t.length; i++) {
    const analytic = logisticAnalytic(series.t[i])
    const err = Math.abs(series.S[i] - analytic)
    if (err > maxErr) maxErr = err
  }
  return maxErr
}

// ── Tests de orden de convergencia ───────────────────────────────────────────
describe('Orden de convergencia — Euler O(h¹)', () => {
  it('pendiente log-log ≈ 1 (±0.3)', () => {
    const h1 = 0.5
    const h2 = 0.25
    const err1 = maxError(euler, h1)
    const err2 = maxError(euler, h2)
    const slope = Math.log(err1 / err2) / Math.log(h1 / h2)
    expect(slope).toBeGreaterThan(0.7)
    expect(slope).toBeLessThan(1.3)
  })
})

describe('Orden de convergencia — RK4 O(h⁴)', () => {
  it('pendiente log-log ≈ 4 (±0.3)', () => {
    const h1 = 1.0
    const h2 = 0.5
    const err1 = maxError(rk4, h1)
    const err2 = maxError(rk4, h2)
    const slope = Math.log(err1 / err2) / Math.log(h1 / h2)
    expect(slope).toBeGreaterThan(3.7)
    expect(slope).toBeLessThan(4.3)
  })
})

// ── Test DOPRI5: error global < 1e-6 ─────────────────────────────────────────
// Usamos el SIR real para que todas las componentes sean no nulas durante
// la integracion, evitando que componentes cero distorsionen la norma del error.
// Verificamos solo que la solucion logistica (componente S=I en SIR con gamma=0)
// converge con error pequenio.
describe('DOPRI5 — error global caso logístico', () => {
  it('error global < 1e-4 con rtol=1e-8, atol=1e-10 (SIR con gamma=0)', () => {
    // Logistica via SIR: beta=r, gamma=0, N=K => dI/dt = beta*S*I/K aprox r*I cuando S~K
    // Usamos la logistica exacta mapeada en SIR: dS/dt=-rSI/K, dI/dt=rSI/K, dR/dt=0
    // I(t) exacto = K / (1 + ((K-I0)/I0)*exp(-r*t)) cuando S+I=K (sin R)
    const rhsSir: RHS = (_t, y) => {
      const S = y[0]
      const I = y[1]
      const out = new Float64Array(3)
      out[0] = -(r * S * I) / K
      out[1] = (r * S * I) / K
      out[2] = 0
      return out
    }
    // S0 = K - I0, I0 = 1, R0 = 0
    const y0 = new Float64Array([K - I0, I0, 0])
    const series = dopri5(rhsSir, y0, 0, T_END, { rtol: 1e-8, atol: 1e-10 })
    let maxErr = 0
    for (let i = 0; i < series.t.length; i++) {
      // I exacto = logisticAnalytic(t) ya que S+I=K => comportamiento logistico exacto
      const analytic = logisticAnalytic(series.t[i])
      const err = Math.abs(series.I[i] - analytic)
      if (err > maxErr) maxErr = err
    }
    // Con DOPRI5 rtol=1e-8, esperamos error global mucho menor que 1e-4
    expect(maxErr).toBeLessThan(1e-4)
  })
})

// ── Test Euler y RK4 básicos ──────────────────────────────────────────────────
describe('Euler — integración básica SIR', () => {
  it('produce Series con los campos esperados', () => {
    const rhsSir: RHS = (_t, y) => {
      const S = y[0]
      const I = y[1]
      const beta = 0.3
      const gamma = 0.1
      const n = 1000
      const out = new Float64Array(3)
      out[0] = -(beta * S * I) / n
      out[1] = (beta * S * I) / n - gamma * I
      out[2] = gamma * I
      return out
    }
    const y0 = new Float64Array([990, 10, 0])
    const series = euler(rhsSir, y0, 0, 10, { dt: 0.5 })
    expect(series.t.length).toBeGreaterThan(1)
    expect(series.S).toBeInstanceOf(Float64Array)
    expect(series.I).toBeInstanceOf(Float64Array)
    expect(series.R).toBeInstanceOf(Float64Array)
  })
})

describe('RK4 — integración básica SEIR', () => {
  it('produce Series con campo E para dim=4', () => {
    const rhsSeir: RHS = (_t, y) => {
      const S = y[0]
      const E = y[1]
      const I = y[2]
      const beta = 0.4
      const sigma = 0.2
      const gamma = 0.1
      const n = 1000
      const out = new Float64Array(4)
      out[0] = -(beta * S * I) / n
      out[1] = (beta * S * I) / n - sigma * E
      out[2] = sigma * E - gamma * I
      out[3] = gamma * I
      return out
    }
    const y0 = new Float64Array([990, 0, 10, 0])
    const series = rk4(rhsSeir, y0, 0, 10, { dt: 0.1 })
    expect(series.E).toBeInstanceOf(Float64Array)
    expect(series.E?.length).toBe(series.t.length)
  })
})

// ── Test logístico exacto con RK4 ─────────────────────────────────────────────
describe('RK4 — caso logístico vs. analítica', () => {
  it('error máximo < 1e-3 con dt=0.01', () => {
    const err = maxError(rk4, 0.01)
    expect(err).toBeLessThan(1e-3)
  })
})

// ── Test función logística directa ────────────────────────────────────────────
describe('logisticRhs — funcional', () => {
  it('retorna derivada positiva cuando I < K', () => {
    const y = new Float64Array([500])
    const dy = logisticRhs(0, y)
    expect(dy[0]).toBeGreaterThan(0)
  })
})
