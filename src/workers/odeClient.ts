/**
 * @fileoverview Cliente para interactuar con ode.worker.ts.
 * Incluye gestión de concurrencia y fallback síncrono para entornos sin soporte de Workers.
 * (SIR-Net Lab)
 */

import type { AppState } from '../state/store.ts'
import type { OdeWorkerRequest, OdeWorkerResponse } from './ode.worker.ts'
import { sirRhs } from '../core/models/sir.ts'
import { seirRhs } from '../core/models/seir.ts'
import { seisRhs } from '../core/models/seis.ts'
import { euler } from '../core/solvers/euler.ts'
import { rk4 } from '../core/solvers/rk4.ts'
import { dopri5 } from '../core/solvers/dopri5.ts'
import { detectEvents } from '../core/solvers/events.ts'
import { computeR0, criticalCoverage } from '../core/analysis/r0.ts'
import { analyticalPeak } from '../core/analysis/peak.ts'
import { finalSize } from '../core/analysis/finalSize.ts'
import type { Series, SolverOpts } from '../core/models/types.ts'

export type { OdeWorkerResponse }

let workerInstance: Worker | null = null
let currentRequestId = 0

/**
 * Ejecuta la simulación de forma síncrona en el hilo principal (fallback).
 */
export function simulateSync(state: AppState): OdeWorkerResponse {
  const { params, solver: solverType, model: modelType, tMax, dt } = state
  const { N, i0 } = params
  const s0 = N - i0

  const solverFn = solverType === 'euler' ? euler : solverType === 'dopri5' ? dopri5 : rk4
  const opts: SolverOpts = {
    dt,
    rtol: 1e-8,
    atol: 1e-10,
  }

  let series: Series
  if (modelType === 'seir') {
    const y0 = new Float64Array([s0, 0, i0, 0])
    series = solverFn(seirRhs(params), y0, 0, tMax, opts)
  } else if (modelType === 'seis') {
    const y0 = new Float64Array([s0, 0, i0])
    series = solverFn(seisRhs(params), y0, 0, tMax, opts)
  } else {
    const y0 = new Float64Array([s0, i0, 0])
    series = solverFn(sirRhs(params), y0, 0, tMax, opts)
  }

  const events = detectEvents(series, params)
  const r0 = computeR0(params)
  const pc = criticalCoverage(r0)
  const aPeak = analyticalPeak(params)
  const fSize = finalSize(params)

  return {
    id: 0,
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
}

/**
 * Inicializa o reutiliza la instancia del Worker.
 */
function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('./ode.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      workerInstance = null
    }
  }
  return workerInstance
}

/**
 * Envía una petición de simulación al worker y retorna una promesa con el resultado.
 * Si el worker no está disponible, resuelve usando la función síncrona.
 */
export function simulateAsync(state: AppState): Promise<OdeWorkerResponse> {
  const worker = getWorker()
  if (!worker) {
    return Promise.resolve(simulateSync(state))
  }

  const id = ++currentRequestId

  return new Promise((resolve) => {
    const handler = (event: MessageEvent<OdeWorkerResponse>): void => {
      if (event.data.id === id) {
        worker.removeEventListener('message', handler)
        resolve(event.data)
      }
    }

    worker.addEventListener('message', handler)

    const req: OdeWorkerRequest = {
      id,
      params: state.params,
      solver: state.solver,
      model: state.model,
      tMax: state.tMax,
      dt: state.dt,
    }

    worker.postMessage(req)
  })
}
