/**
 * @fileoverview Cliente para interactuar con network.worker.ts.
 * Incluye gestión de concurrencia y fallback síncrono para tests.
 * (SIR-Net Lab)
 */

import type { Graph, NetworkMetrics } from '../sim/graphs/types.ts'
import type { ErParams } from '../sim/graphs/er.ts'
import type { WsParams } from '../sim/graphs/ws.ts'
import type { BaParams } from '../sim/graphs/ba.ts'
import { generateErdosRenyi } from '../sim/graphs/er.ts'
import { generateWattsStrogatz } from '../sim/graphs/ws.ts'
import { generateBarabasiAlbert } from '../sim/graphs/ba.ts'
import { computeNetworkMetrics } from '../sim/graphs/metrics.ts'
import { simulateGillespie, type GillespieParams } from '../sim/gillespie.ts'
import { sirRhs } from '../core/models/sir.ts'
import { rk4 } from '../core/solvers/rk4.ts'
import type { BatchComparisonResult } from './network.worker.ts'

export type { BatchComparisonResult }

let workerInstance: Worker | null = null
let currentRequestId = 0

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('./network.worker.ts', import.meta.url), {
        type: 'module',
      })
    } catch {
      workerInstance = null
    }
  }
  return workerInstance
}

/**
 * Genera un grafo de forma síncrona (fallback para Vitest/Node).
 */
export function generateGraphSync(
  topology: 'er' | 'ws' | 'ba',
  params: ErParams | WsParams | BaParams,
  beta = 0.6,
  gamma = 0.2
): { graph: Graph; metrics: NetworkMetrics } {
  let graph: Graph
  if (topology === 'er') {
    graph = generateErdosRenyi(params as ErParams)
  } else if (topology === 'ws') {
    graph = generateWattsStrogatz(params as WsParams)
  } else {
    graph = generateBarabasiAlbert(params as BaParams)
  }
  const metrics = computeNetworkMetrics(graph, beta, gamma)
  return { graph, metrics }
}

/**
 * Genera un grafo en el Worker de fondo.
 */
export function generateGraphAsync(
  topology: 'er' | 'ws' | 'ba',
  params: ErParams | WsParams | BaParams,
  beta = 0.6,
  gamma = 0.2
): Promise<{ graph: Graph; metrics: NetworkMetrics }> {
  const worker = getWorker()
  if (!worker) {
    return Promise.resolve(generateGraphSync(topology, params, beta, gamma))
  }

  const id = ++currentRequestId

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent): void => {
      if (event.data?.id === id) {
        worker.removeEventListener('message', handler)
        if (event.data.ok) {
          resolve({
            graph: event.data.graph,
            metrics: event.data.metrics,
          })
        } else {
          reject(new Error(event.data.error ?? 'Error al generar grafo'))
        }
      }
    }

    worker.addEventListener('message', handler)
    worker.postMessage({
      type: 'GENERATE_GRAPH',
      id,
      topology,
      params,
      beta,
      gamma,
    })
  })
}

/**
 * Ejecuta lote de simulaciones estocásticas de forma síncrona (fallback).
 */
export function runBatchSync(options: {
  graph: Graph
  beta: number
  gamma: number
  sigma?: number
  i0: number
  tMax: number
  dt: number
  mRuns: number
  baseSeed: number
}): BatchComparisonResult {
  const { graph, beta, gamma, sigma = 0, i0, tMax, dt, mRuns, baseSeed } = options
  const numSteps = Math.floor(tMax / dt) + 1

  const iRunsMatrix: number[][] = Array.from({ length: numSteps }, () => [])
  const sSums = new Float64Array(numSteps)
  const rSums = new Float64Array(numSteps)
  let timeGrid: Float64Array | null = null

  for (let run = 0; run < mRuns; run++) {
    const seed = baseSeed + run * 1013
    const gParams: GillespieParams = {
      graph,
      beta,
      gamma,
      sigma,
      i0,
      tMax,
      dt,
      seed,
      recordHistory: false,
    }

    const runResult = simulateGillespie(gParams)
    if (!timeGrid) {
      timeGrid = runResult.t
    }

    const len = Math.min(numSteps, runResult.t.length)
    for (let step = 0; step < len; step++) {
      const iVal = runResult.I[step] ?? 0
      const sVal = runResult.S[step] ?? 0
      const rVal = runResult.R[step] ?? 0

      iRunsMatrix[step]?.push(iVal)
      sSums[step] += sVal
      rSums[step] += rVal
    }
  }

  const meanI: number[] = new Array<number>(numSteps)
  const p5I: number[] = new Array<number>(numSteps)
  const p95I: number[] = new Array<number>(numSteps)
  const meanS: number[] = new Array<number>(numSteps)
  const meanR: number[] = new Array<number>(numSteps)

  for (let step = 0; step < numSteps; step++) {
    const iValues = (iRunsMatrix[step] ?? []).sort((a, b) => a - b)
    const count = iValues.length
    if (count > 0) {
      const sum = iValues.reduce((acc, v) => acc + v, 0)
      meanI[step] = sum / count

      const p5Idx = Math.floor(count * 0.05)
      const p95Idx = Math.min(count - 1, Math.floor(count * 0.95))
      p5I[step] = iValues[p5Idx] ?? 0
      p95I[step] = iValues[p95Idx] ?? 0

      meanS[step] = (sSums[step] ?? 0) / count
      meanR[step] = (rSums[step] ?? 0) / count
    } else {
      meanI[step] = 0
      p5I[step] = 0
      p95I[step] = 0
      meanS[step] = 0
      meanR[step] = 0
    }
  }

  const s0 = graph.n - i0
  const odeRhs = sirRhs({ N: graph.n, beta, gamma, i0 })
  const odeSeries = rk4(odeRhs, new Float64Array([s0, i0, 0]), 0, tMax, { dt })

  const odeI = Array.from(odeSeries.I)
  const odeS = Array.from(odeSeries.S)
  const odeR = Array.from(odeSeries.R)

  let sumSqDiff = 0
  const compSteps = Math.min(meanI.length, odeI.length)
  for (let s = 0; s < compSteps; s++) {
    const diff = (meanI[s] ?? 0) - (odeI[s] ?? 0)
    sumSqDiff += diff * diff
  }
  const rmseI = compSteps > 0 ? Math.sqrt(sumSqDiff / compSteps) : 0

  return {
    t: timeGrid ? Array.from(timeGrid) : [],
    meanI,
    p5I,
    p95I,
    meanS,
    meanR,
    odeI,
    odeS,
    odeR,
    rmseI,
  }
}

/**
 * Ejecuta lote de simulaciones estocásticas en el Worker de fondo.
 */
export function runBatchAsync(
  options: {
    graph: Graph
    beta: number
    gamma: number
    sigma?: number
    i0: number
    tMax: number
    dt: number
    mRuns: number
    baseSeed: number
  },
  onProgress?: (completed: number, total: number) => void
): Promise<BatchComparisonResult> {
  const worker = getWorker()
  if (!worker) {
    return Promise.resolve(runBatchSync(options))
  }

  const id = ++currentRequestId

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent): void => {
      if (event.data?.id === id) {
        if (event.data.type === 'BATCH_PROGRESS') {
          onProgress?.(event.data.completed, event.data.total)
        } else if (event.data.type === 'BATCH_COMPLETED') {
          worker.removeEventListener('message', handler)
          resolve(event.data.result)
        } else if (event.data.ok === false) {
          worker.removeEventListener('message', handler)
          reject(new Error(event.data.error ?? 'Error en simulación por lotes'))
        }
      }
    }

    worker.addEventListener('message', handler)
    worker.postMessage({
      type: 'RUN_BATCH',
      id,
      ...options,
    })
  })
}
