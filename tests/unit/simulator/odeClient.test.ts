import { describe, it, expect } from 'vitest'
import { simulateSync } from '../../../src/workers/odeClient.ts'
import { DEFAULT_STATE } from '../../../src/state/store.ts'

describe('Simulación ODE y Cliente (F3)', () => {
  it('resuelve el modelo SIR por defecto con RK4', () => {
    const res = simulateSync(DEFAULT_STATE)

    expect(res.ok).toBe(true)
    expect(res.series).toBeDefined()
    expect(res.analysis).toBeDefined()

    const { series, analysis, events } = res
    expect(series?.t.length).toBeGreaterThan(10)
    expect(series?.S[0]).toBe(DEFAULT_STATE.params.N - DEFAULT_STATE.params.i0)
    expect(series?.I[0]).toBe(DEFAULT_STATE.params.i0)

    // R0 esperado = beta / gamma = 0.6 / 0.2 = 3.0
    expect(analysis?.r0).toBeCloseTo(3.0)
    expect(analysis?.criticalCoverage).toBeCloseTo(1 - 1 / 3.0)

    // Conservación de población: S + I + R ≈ N
    if (series) {
      for (let i = 0; i < series.t.length; i += 10) {
        const sVal = series.S[i] ?? 0
        const iVal = series.I[i] ?? 0
        const rVal = series.R[i] ?? 0
        expect(sVal + iVal + rVal).toBeCloseTo(DEFAULT_STATE.params.N, 1)
      }
    }

    // Pico detectado
    expect(events?.peakI).toBeGreaterThan(DEFAULT_STATE.params.i0)
    expect(events?.peakTime).toBeGreaterThan(0)
  })

  it('resuelve el modelo SEIR con compartimento Expuestos', () => {
    const seirState = {
      ...DEFAULT_STATE,
      model: 'seir' as const,
      params: { ...DEFAULT_STATE.params, sigma: 0.5 },
    }

    const res = simulateSync(seirState)
    expect(res.ok).toBe(true)
    expect(res.series?.E).toBeDefined()
    expect(res.series?.E?.length).toBe(res.series?.t.length)

    // Inicialmente E = 0
    expect(res.series?.E?.[0]).toBe(0)

    // En algún momento intermedio E se vuelve positivo
    const maxE = Math.max(...(res.series?.E ?? []))
    expect(maxE).toBeGreaterThan(0)
  })

  it('funciona con solucionador DOPRI5 adaptativo', () => {
    const dopriState = {
      ...DEFAULT_STATE,
      solver: 'dopri5' as const,
    }

    const res = simulateSync(dopriState)
    expect(res.ok).toBe(true)
    expect(res.series?.t.length).toBeGreaterThan(0)
  })

  it('funciona con solucionador Euler', () => {
    const eulerState = {
      ...DEFAULT_STATE,
      solver: 'euler' as const,
    }

    const res = simulateSync(eulerState)
    expect(res.ok).toBe(true)
    expect(res.series?.t.length).toBeGreaterThan(0)
  })
})
