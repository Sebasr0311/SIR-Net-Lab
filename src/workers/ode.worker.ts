/**
 * @fileoverview Web Worker para resolver modelos ODE (SIR / SEIR / SEIS).
 * Ejecuta la integración numérica en un hilo secundario para no bloquear el hilo de UI.
 * Cumple RNF-01 (recálculo en < 50 ms). (SIR-Net Lab)
 */

import type { Params, Series, SolverOpts } from '../core/models/types.ts'
import { sirRhs } from '../core/models/sir.ts'
import { seirRhs } from '../core/models/seir.ts'
import { seisRhs } from '../core/models/seis.ts'
import { euler } from '../core/solvers/euler.ts'
import { rk4 } from '../core/solvers/rk4.ts'
import { dopri5 } from '../core/solvers/dopri5.ts'
import { detectEvents, type EventResult } from '../core/solvers/events.ts'
import { computeR0, criticalCoverage } from '../core/analysis/r0.ts'
import { analyticalPeak } from '../core/analysis/peak.ts'
import { finalSize } from '../core/analysis/finalSize.ts'

export interface OdeWorkerRequest {
  id: number
  params: Params
  solver: 'euler' | 'rk4' | 'dopri5'
  model: 'sir' | 'seir' | 'seis'
  tMax: number
  dt: number
}

export interface OdeWorkerResponse {
  id: number
  ok: boolean
  error?: string
  series?: {
    t: number[]
    S: number[]
    E?: number[]
    I: number[]
    R: number[]
  }
  events?: EventResult
  analysis?: {
    r0: number
    criticalCoverage: number
    analyticalPeak: { iMax: number; sAtPeak: number }
    finalSize: { sInfinity: number; attackRate: number }
  }
}

self.onmessage = (event: MessageEvent<OdeWorkerRequest>): void => {
  const req = event.data
  try {
    const { params, solver: solverType, model: modelType, tMax, dt } = req
    const { N, i0 } = params
    const s0 = N - i0

    let series: Series

    const solverFn = solverType === 'euler' ? euler : solverType === 'dopri5' ? dopri5 : rk4
    const opts: SolverOpts = {
      dt,
      rtol: 1e-8,
      atol: 1e-10,
    }

    if (modelType === 'seir') {
      const e0 = 0
      const r0Val = 0
      const y0 = new Float64Array([s0, e0, i0, r0Val])
      const rhs = seirRhs(params)
      series = solverFn(rhs, y0, 0, tMax, opts)
    } else if (modelType === 'seis') {
      const e0 = 0
      const y0 = new Float64Array([s0, e0, i0])
      const rhs = seisRhs(params)
      series = solverFn(rhs, y0, 0, tMax, opts)
    } else {
      // sir por defecto
      const r0Val = 0
      const y0 = new Float64Array([s0, i0, r0Val])
      const rhs = sirRhs(params)
      series = solverFn(rhs, y0, 0, tMax, opts)
    }

    // Detección de eventos y métricas analíticas
    const events = detectEvents(series, params)
    const r0 = computeR0(params)
    const pc = criticalCoverage(r0)
    const aPeak = analyticalPeak(params)
    const fSize = finalSize(params)

    // Convertir Float64Array a Array regular transferible
    const payload: OdeWorkerResponse = {
      id: req.id,
      ok: true,
      series: {
        t: Array.from(series.t),
        S: Array.from(series.S),
        E: series.E ? Array.from(series.E) : undefined,
        I: Array.from(series.I),
        R: Array.from(series.R),
      },
      events,
      analysis: {
        r0,
        criticalCoverage: pc,
        analyticalPeak: aPeak,
        finalSize: fSize,
      },
    }

    self.postMessage(payload)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const failPayload: OdeWorkerResponse = {
      id: req.id,
      ok: false,
      error: errorMsg,
    }
    self.postMessage(failPayload)
  }
}
