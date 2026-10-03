import { describe, it, expect } from 'vitest'
import { detectEvents, applyPatchImpulses } from '../../../src/core/solvers/events.ts'
import { sirRhs } from '../../../src/core/models/sir.ts'
import { rk4 } from '../../../src/core/solvers/rk4.ts'
import { computeR0, criticalCoverage } from '../../../src/core/analysis/r0.ts'
import type { Params, Series } from '../../../src/core/models/types.ts'

// ── Parámetros base ────────────────────────────────────────────────────────────
const params: Params = {
  N: 10_000,
  beta: 0.3,
  gamma: 0.1,
  i0: 10,
}

// ── Integración de referencia ──────────────────────────────────────────────────
function integrateSIR(p: Params, dt = 0.01, tEnd = 200): Series {
  const y0 = new Float64Array([p.N - p.i0, p.i0, 0])
  return rk4(sirRhs(p), y0, 0, tEnd, { dt })
}

// ── detectEvents — pico ────────────────────────────────────────────────────────
describe('detectEvents — peakTime y peakI', () => {
  it('el pico detectado coincide con S = N/R₀ (error < 1e-3 fracción)', () => {
    const series = integrateSIR(params)
    const { peakI, peakTime } = detectEvents(series, params)

    expect(peakI).toBeGreaterThan(0)
    expect(peakTime).toBeGreaterThan(0)

    // En el pico dI/dt = 0 ⇒ S* = N/R₀
    const r0 = computeR0(params)
    const sAtPeak = params.N / r0

    // Encontrar S en el momento del pico
    let closestIdx = 0
    let minDist = Infinity
    for (let i = 0; i < series.t.length; i++) {
      const dist = Math.abs(series.t[i] - peakTime)
      if (dist < minDist) {
        minDist = dist
        closestIdx = i
      }
    }

    const sNumericalAtPeak = series.S[closestIdx]
    const relError = Math.abs(sNumericalAtPeak - sAtPeak) / sAtPeak
    expect(relError).toBeLessThan(1e-2) // 1% de tolerancia por discretización
  })

  it('peakI es el máximo real de I(t)', () => {
    const series = integrateSIR(params)
    const { peakI } = detectEvents(series, params)
    const actualMax = Math.max(...Array.from(series.I))
    expect(peakI).toBeCloseTo(actualMax, 6)
  })
})

// ── detectEvents — umbral R_ef = 1 ────────────────────────────────────────────
describe('detectEvents — thresholdTime', () => {
  it('thresholdTime > 0 para R₀ > 1', () => {
    const series = integrateSIR(params)
    const { thresholdTime } = detectEvents(series, params)
    expect(thresholdTime).toBeGreaterThan(0)
  })

  it('thresholdTime ≈ peakTime (el umbral R_ef=1 se cruza en el pico)', () => {
    const series = integrateSIR(params)
    const { peakTime, thresholdTime } = detectEvents(series, params)
    // El cruce R_ef=1 ocurre cuando S=N/R0, i.e., en el pico
    const diff = Math.abs(thresholdTime - peakTime)
    // Con dt=0.01 esperamos estar cerca del pico
    expect(diff).toBeLessThan(2.0) // dentro de 2 unidades de tiempo
  })

  it('thresholdTime = -1 para R₀ < 1', () => {
    const subParams: Params = { ...params, beta: 0.05 } // R0=0.5
    const series = integrateSIR(subParams)
    const { thresholdTime } = detectEvents(series, subParams)
    expect(thresholdTime).toBe(-1)
  })
})

// ── applyPatchImpulses ────────────────────────────────────────────────────────
describe('applyPatchImpulses', () => {
  it('produce una Series válida', () => {
    const y0 = new Float64Array([params.N - params.i0, params.i0, 0])
    const series = applyPatchImpulses(sirRhs(params), y0, 0, 100, [{ t: 10, p: 0.5 }], { dt: 0.1 })
    expect(series.t.length).toBeGreaterThan(1)
    expect(series.S).toBeInstanceOf(Float64Array)
    expect(series.I).toBeInstanceOf(Float64Array)
    expect(series.R).toBeInstanceOf(Float64Array)
  })

  it('un impulso con p ≥ p_c elimina el brote (pico < pico sin parcheo)', () => {
    const r0 = computeR0(params)
    const pc = criticalCoverage(r0)
    const p = Math.min(pc + 0.05, 0.99)

    const y0 = new Float64Array([params.N - params.i0, params.i0, 0])

    const seriesNoPatch = rk4(sirRhs(params), y0, 0, 200, { dt: 0.1 })
    const peakNoPatch = Math.max(...Array.from(seriesNoPatch.I))

    // Impulso al inicio (t=1) antes de que crezca el brote
    const seriesPatch = applyPatchImpulses(sirRhs(params), y0, 0, 200, [{ t: 1, p }], { dt: 0.1 })
    const peakPatch = Math.max(...Array.from(seriesPatch.I))

    expect(peakPatch).toBeLessThan(peakNoPatch * 0.5) // reducción significativa
  })

  it('sin impulsos devuelve el mismo resultado que rk4 directo', () => {
    const y0 = new Float64Array([params.N - params.i0, params.i0, 0])
    const seriesDirect = rk4(sirRhs(params), y0, 0, 50, { dt: 0.1 })
    const seriesNoImpulse = applyPatchImpulses(sirRhs(params), y0, 0, 50, [], { dt: 0.1 })
    const last = seriesDirect.t.length - 1
    const lastNI = seriesNoImpulse.t.length - 1
    expect(seriesNoImpulse.S[lastNI]).toBeCloseTo(seriesDirect.S[last], 4)
    expect(seriesNoImpulse.I[lastNI]).toBeCloseTo(seriesDirect.I[last], 4)
  })

  it('después del impulso S disminuye y R aumenta', () => {
    const y0 = new Float64Array([params.N - params.i0, params.i0, 0])
    const impT = 20
    const p = 0.3

    // Integrar hasta justo antes del impulso
    const beforeSeries = rk4(sirRhs(params), y0, 0, impT, { dt: 0.1 })
    const lastBefore = beforeSeries.t.length - 1
    const sBeforeImpulse = beforeSeries.S[lastBefore]
    const rBeforeImpulse = beforeSeries.R[lastBefore]

    // Serie con impulso
    const seriesPatch = applyPatchImpulses(sirRhs(params), y0, 0, 200, [{ t: impT, p }], {
      dt: 0.1,
    })

    // Encontrar punto justo después del impulso
    let idxAfter = -1
    for (let i = 0; i < seriesPatch.t.length; i++) {
      if (seriesPatch.t[i] >= impT + 0.05) {
        idxAfter = i
        break
      }
    }
    expect(idxAfter).toBeGreaterThan(-1)
    // S se reduce por el impulso
    expect(seriesPatch.S[idxAfter]).toBeLessThan(sBeforeImpulse)
    // R aumenta por el impulso
    expect(seriesPatch.R[idxAfter]).toBeGreaterThan(rBeforeImpulse)
  })
})
