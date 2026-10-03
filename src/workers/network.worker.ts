/**
 * @fileoverview Web Worker para simulación estocástica en redes complejas.
 * Genera grafos (ER, WS, BA), ejecuta simulaciones de Gillespie individuales
 * y realiza barridos Monte Carlo de M corridas con bandas percentiles.
 * (SIR-Net Lab — docs/02 §2.3, T4.1, T4.2, T4.5)
 */

import { generateErdosRenyi, type ErParams } from '../sim/graphs/er.ts'
import { generateWattsStrogatz, type WsParams } from '../sim/graphs/ws.ts'
import { generateBarabasiAlbert, type BaParams } from '../sim/graphs/ba.ts'
import { computeNetworkMetrics } from '../sim/graphs/metrics.ts'
import { simulateGillespie, type GillespieParams } from '../sim/gillespie.ts'
import type { Graph, NetworkMetrics } from '../sim/graphs/types.ts'
import { sirRhs } from '../core/models/sir.ts'
import { rk4 } from '../core/solvers/rk4.ts'

export interface GenerateGraphRequest {
  type: 'GENERATE_GRAPH'
  id: number
  topology: 'er' | 'ws' | 'ba'
  params: ErParams | WsParams | BaParams
  beta?: number
  gamma?: number
}

export interface RunBatchRequest {
  type: 'RUN_BATCH'
  id: number
  graph: Graph
  beta: number
  gamma: number
  sigma?: number
  i0: number
  tMax: number
  dt: number
  mRuns: number
  baseSeed: number
}

export interface BatchComparisonResult {
  t: number[]
  meanI: number[]
  p5I: number[]
  p95I: number[]
  meanS: number[]
  meanR: number[]
  odeI: number[]
  odeS: number[]
  odeR: number[]
  rmseI: number
}

self.onmessage = (event: MessageEvent<GenerateGraphRequest | RunBatchRequest>): void => {
  const req = event.data

  try {
    if (req.type === 'GENERATE_GRAPH') {
      const { topology, params, beta = 0.6, gamma = 0.2 } = req
      let graph: Graph

      if (topology === 'er') {
        graph = generateErdosRenyi(params as ErParams)
      } else if (topology === 'ws') {
        graph = generateWattsStrogatz(params as WsParams)
      } else {
        graph = generateBarabasiAlbert(params as BaParams)
      }

      const metrics: NetworkMetrics = computeNetworkMetrics(graph, beta, gamma)

      self.postMessage({
        type: 'GRAPH_GENERATED',
        id: req.id,
        ok: true,
        graph,
        metrics,
      })
    } else if (req.type === 'RUN_BATCH') {
      const { graph, beta, gamma, sigma = 0, i0, tMax, dt, mRuns, baseSeed } = req
      const numSteps = Math.floor(tMax / dt) + 1

      // Acumuladores de las M corridas para cada punto en el tiempo
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

        // Notificar progreso periódicamente
        if (run % 5 === 0 || run === mRuns - 1) {
          self.postMessage({
            type: 'BATCH_PROGRESS',
            id: req.id,
            completed: run + 1,
            total: mRuns,
          })
        }
      }

      // Calcular medias y percentiles 5% y 95%
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

      // Resolver EDO determinista correspondiente para comparar
      const s0 = graph.n - i0
      const odeRhs = sirRhs({ N: graph.n, beta, gamma, i0 })
      const odeSeries = rk4(odeRhs, new Float64Array([s0, i0, 0]), 0, tMax, { dt })

      const odeI = Array.from(odeSeries.I)
      const odeS = Array.from(odeSeries.S)
      const odeR = Array.from(odeSeries.R)

      // Calcular RMSE entre la media estocástica y la EDO
      let sumSqDiff = 0
      const compSteps = Math.min(meanI.length, odeI.length)
      for (let s = 0; s < compSteps; s++) {
        const diff = (meanI[s] ?? 0) - (odeI[s] ?? 0)
        sumSqDiff += diff * diff
      }
      const rmseI = compSteps > 0 ? Math.sqrt(sumSqDiff / compSteps) : 0

      const result: BatchComparisonResult = {
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

      self.postMessage({
        type: 'BATCH_COMPLETED',
        id: req.id,
        ok: true,
        result,
      })
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    self.postMessage({
      id: req.id,
      ok: false,
      error: errorMsg,
    })
  }
}
