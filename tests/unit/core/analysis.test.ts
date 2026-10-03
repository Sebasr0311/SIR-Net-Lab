import { describe, it, expect } from 'vitest'
import { computeR0, computeReff, criticalCoverage } from '../../../src/core/analysis/r0.ts'
import { analyticalPeak } from '../../../src/core/analysis/peak.ts'
import { finalSize } from '../../../src/core/analysis/finalSize.ts'
import {
  equilibriumStability,
  jacobianEigenvalues,
} from '../../../src/core/analysis/equilibrium.ts'
import { sirRhs } from '../../../src/core/models/sir.ts'
import { rk4 } from '../../../src/core/solvers/rk4.ts'
import { applyPatchImpulses } from '../../../src/core/solvers/events.ts'
import type { Params } from '../../../src/core/models/types.ts'

// ── Parámetros de referencia §2.8 ─────────────────────────────────────────────
const baseParams: Params = {
  N: 10_000,
  beta: 0.3,
  gamma: 0.1,
  i0: 10,
}
// R0 = 3

// ── T1.6: R₀ ──────────────────────────────────────────────────────────────────
describe('computeR0', () => {
  it('R₀ = β/γ exacto', () => {
    expect(computeR0(baseParams)).toBeCloseTo(3.0, 10)
    expect(computeR0({ ...baseParams, beta: 0.5, gamma: 0.2 })).toBeCloseTo(2.5, 10)
  })

  it('R₀ = 1 cuando β = γ', () => {
    expect(computeR0({ ...baseParams, beta: 0.1, gamma: 0.1 })).toBeCloseTo(1.0, 10)
  })
})

describe('computeReff', () => {
  it('R_ef(0) ≈ R₀ cuando S ≈ N', () => {
    const r0 = computeR0(baseParams)
    const rEff = computeReff(r0, baseParams.N - baseParams.i0, baseParams.N)
    expect(rEff).toBeCloseTo(r0 * (1 - baseParams.i0 / baseParams.N), 8)
  })
})

describe('criticalCoverage', () => {
  it('p_c = 1 - 1/R₀ para eficacia = 1', () => {
    const r0 = 3
    const pc = criticalCoverage(r0)
    expect(pc).toBeCloseTo(1 - 1 / r0, 10)
  })

  it('R₀ ≤ 1 → p_c = 0', () => {
    expect(criticalCoverage(0.8)).toBe(0)
    expect(criticalCoverage(1.0)).toBe(0)
  })

  it('con cobertura p ≥ p_c la simulación no genera brote', () => {
    const r0 = computeR0(baseParams)
    const pc = criticalCoverage(r0)
    const p = pc + 0.05 // ligeramente por encima del umbral
    // Vacunamos fraccion p de S al inicio
    const sVacunados = baseParams.N * p
    const sIniciales = baseParams.N - baseParams.i0 - sVacunados
    // Verificar que R_ef inicial < 1
    const rEffInicial = computeReff(r0, sIniciales, baseParams.N)
    expect(rEffInicial).toBeLessThan(1.0)
  })
})

// ── T1.6: Pico analítico ──────────────────────────────────────────────────────
describe('analyticalPeak', () => {
  it('S_pico = N/R₀', () => {
    const { sAtPeak } = analyticalPeak(baseParams)
    const r0 = computeR0(baseParams)
    expect(sAtPeak).toBeCloseTo(baseParams.N / r0, 6)
  })

  it('pico analítico vs. pico numérico RK4 (dt=0.01): error relativo < 1e-3', () => {
    const { iMax } = analyticalPeak(baseParams)
    const y0 = new Float64Array([baseParams.N - baseParams.i0, baseParams.i0, 0])
    const series = rk4(sirRhs(baseParams), y0, 0, 160, { dt: 0.01 })
    const iMaxNum = Math.max(...Array.from(series.I))
    const relError = Math.abs(iMax - iMaxNum) / iMax
    expect(relError).toBeLessThan(1e-3)
  })
})

// ── T1.6: Tamaño final ────────────────────────────────────────────────────────
describe('finalSize', () => {
  it('tamaño final analítico vs. S(t_final) numérico: error < 1e-4 en fracción', () => {
    const { sInfinity } = finalSize(baseParams)
    const y0 = new Float64Array([baseParams.N - baseParams.i0, baseParams.i0, 0])
    // Integrar hasta que I → 0
    const series = rk4(sirRhs(baseParams), y0, 0, 300, { dt: 0.05 })
    const sNum = series.S[series.S.length - 1]
    const errorFrac = Math.abs(sInfinity - sNum) / baseParams.N
    expect(errorFrac).toBeLessThan(1e-4)
  })

  it('attackRate > 0 para R₀ > 1', () => {
    const { attackRate } = finalSize(baseParams)
    expect(attackRate).toBeGreaterThan(0)
  })

  it('attackRate ≈ 0 para R₀ < 1', () => {
    const subThreshold: Params = { ...baseParams, beta: 0.05, gamma: 0.1 }
    const { attackRate } = finalSize(subThreshold)
    // Con R0=0.5, la epidemia no crece; la ecuación da S∞ ≈ S0
    expect(attackRate).toBeLessThan(0.01)
  })
})

// ── T1.6: Estabilidad ─────────────────────────────────────────────────────────
describe('equilibriumStability', () => {
  it('R₀ < 1 → stable: true, eigenvalue < 0', () => {
    const p: Params = { ...baseParams, beta: 0.05, gamma: 0.1 } // R0=0.5
    const { eigenvalue, stable } = equilibriumStability(p)
    expect(stable).toBe(true)
    expect(eigenvalue).toBeLessThan(0)
  })

  it('R₀ > 1 → stable: false, eigenvalue > 0', () => {
    const { eigenvalue, stable } = equilibriumStability(baseParams) // R0=3
    expect(stable).toBe(false)
    expect(eigenvalue).toBeGreaterThan(0)
  })
})

// ── T1.7: Jacobiano y autovalores ─────────────────────────────────────────────
describe('jacobianEigenvalues', () => {
  it('λ₁ = 0 siempre', () => {
    const [lambda1] = jacobianEigenvalues(baseParams, baseParams.N)
    expect(lambda1).toBe(0)
  })

  it('R₀ < 1, S*=N → λ₂ < 0', () => {
    const p: Params = { ...baseParams, beta: 0.05, gamma: 0.1 }
    const [, lambda2] = jacobianEigenvalues(p, p.N)
    expect(lambda2).toBeLessThan(0)
  })

  it('R₀ > 1, S*=N → λ₂ > 0', () => {
    const [, lambda2] = jacobianEigenvalues(baseParams, baseParams.N)
    expect(lambda2).toBeGreaterThan(0)
  })

  it('λ₂ = β·S*/N − γ', () => {
    const sStar = 5000
    const [, lambda2] = jacobianEigenvalues(baseParams, sStar)
    const expected = (baseParams.beta * sStar) / baseParams.N - baseParams.gamma
    expect(lambda2).toBeCloseTo(expected, 12)
  })
})

// ── Escenario §2.8 (valores de referencia) ───────────────────────────────────
describe('Escenario de referencia §2.8 (N=10000, β=0.3, γ=0.1, i0=10)', () => {
  it('R₀ = 3', () => {
    expect(computeR0(baseParams)).toBeCloseTo(3, 6)
  })

  it('p_c ≈ 0.667 para eficacia perfecta', () => {
    expect(criticalCoverage(3)).toBeCloseTo(2 / 3, 4)
  })

  it('pico I_max analítico es positivo y < N', () => {
    const { iMax } = analyticalPeak(baseParams)
    expect(iMax).toBeGreaterThan(0)
    expect(iMax).toBeLessThan(baseParams.N)
  })

  it('S∞ < N - i0 (hubo infecciones)', () => {
    const { sInfinity } = finalSize(baseParams)
    expect(sInfinity).toBeLessThan(baseParams.N - baseParams.i0)
  })
})

// ── Cobertura criticalCoverage con impulso de parcheo ────────────────────────
describe('applyPatchImpulses — p ≥ p_c elimina brote', () => {
  it('con p = p_c + 0.1, pico de I es menor que sin parcheo', () => {
    const r0 = computeR0(baseParams)
    const pc = criticalCoverage(r0)
    const p = Math.min(pc + 0.1, 0.99)

    const y0 = new Float64Array([baseParams.N - baseParams.i0, baseParams.i0, 0])

    // Sin parcheo
    const seriesNoPatch = rk4(sirRhs(baseParams), y0, 0, 200, { dt: 0.1 })
    const peakNoPatch = Math.max(...Array.from(seriesNoPatch.I))

    // Con parcheo al t=5
    const seriesPatch = applyPatchImpulses(sirRhs(baseParams), y0, 0, 200, [{ t: 5, p }], {
      dt: 0.1,
    })
    const peakPatch = Math.max(...Array.from(seriesPatch.I))

    expect(peakPatch).toBeLessThan(peakNoPatch)
  })
})
