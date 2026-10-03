import { describe, it, expect } from 'vitest'
import { simulateEdoCampaign } from '../../../src/core/control/campaigns.ts'
import type { Params } from '../../../src/core/models/types.ts'

describe('Campañas de control por impulsos en EDO (T5.1)', () => {
  const defaultParams: Params = {
    N: 1000,
    beta: 0.6,
    gamma: 0.2,
    i0: 2,
  }

  it('sin impulsos retorna series idénticas y 0 infecciones evitadas', () => {
    const res = simulateEdoCampaign(defaultParams, [], 50, { dt: 0.1 })
    expect(res.preventedInfections).toBe(0)
    expect(res.peakReduction).toBe(0)
    expect(res.controlled.S.length).toBe(res.baseline.S.length)
  })

  it('un impulso en t = 8 causa un salto visible en S y R y reduce el pico de infección (T5.1 CA)', () => {
    const tImpulse = 8
    const pCoverage = 0.4 // 40% de susceptibles parcheados
    const res = simulateEdoCampaign(defaultParams, [{ t: tImpulse, p: pCoverage }], 50, { dt: 0.1 })

    // Encontrar índice cercano a t = 8
    const idxBefore = res.controlled.t.findIndex((time) => time >= tImpulse - 0.15)
    const idxAfter = res.controlled.t.findIndex((time) => time >= tImpulse + 0.15)

    const sBefore = res.controlled.S[idxBefore] ?? 0
    const sAfter = res.controlled.S[idxAfter] ?? 0
    const rBefore = res.controlled.R[idxBefore] ?? 0
    const rAfter = res.controlled.R[idxAfter] ?? 0

    // Salto visible: S cae drásticamente y R sube drásticamente
    expect(sAfter).toBeLessThan(sBefore * 0.75)
    expect(rAfter).toBeGreaterThan(rBefore + sBefore * 0.3)

    // El pico de infectados en la curva controlada es menor que en el baseline
    expect(res.peakReduction).toBeGreaterThan(50)
  })

  it('conserva estrictamente la población total N en cada instante', () => {
    const res = simulateEdoCampaign(
      defaultParams,
      [
        { t: 5, p: 0.2 },
        { t: 15, p: 0.3 },
      ],
      40,
      { dt: 0.1 }
    )

    const { S, I, R } = res.controlled
    for (let i = 0; i < S.length; i++) {
      const total = (S[i] ?? 0) + (I[i] ?? 0) + (R[i] ?? 0)
      expect(total).toBeCloseTo(defaultParams.N, 4)
    }
  })

  it('soporta modelo SEIR con periodo de latencia', () => {
    const seirParams: Params = {
      N: 2000,
      beta: 0.5,
      gamma: 0.15,
      sigma: 0.5,
      i0: 5,
    }

    const res = simulateEdoCampaign(seirParams, [{ t: 10, p: 0.35 }], 60, { dt: 0.1 })
    expect(res.controlled.E).toBeDefined()
    expect(res.peakReduction).toBeGreaterThan(0)
  })
})
