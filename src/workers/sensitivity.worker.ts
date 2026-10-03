/**
 * @fileoverview Web Worker para Análisis de Sensibilidad Global (LHS Monte Carlo).
 * Ejecuta lotes de 1000 a 5000 corridas en segundo plano sin bloquear el hilo principal de renderizado.
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.3
 */

import {
  runGlobalSensitivity,
  type GlobalSensitivityResult,
} from '../core/sensitivity/globalSensitivity.ts'
import type { ParameterRange } from '../core/sensitivity/lhs.ts'

export interface RunLhsRequest {
  type: 'RUN_LHS'
  id: number
  N: number
  i0?: number
  ranges: ParameterRange[]
  sampleCount: number
  seed: number
}

export interface LhsResponse {
  type: 'LHS_RESULT'
  id: number
  result: GlobalSensitivityResult
}

export interface ErrorResponse {
  type: 'ERROR'
  id: number
  error: string
}

self.onmessage = (event: MessageEvent<RunLhsRequest>): void => {
  const req = event.data

  try {
    if (req.type === 'RUN_LHS') {
      const { id, N, i0 = 1, ranges, sampleCount, seed } = req

      const result = runGlobalSensitivity({
        N,
        i0,
        ranges,
        sampleCount,
        seed,
      })

      const response: LhsResponse = {
        type: 'LHS_RESULT',
        id,
        result,
      }

      self.postMessage(response)
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const response: ErrorResponse = {
      type: 'ERROR',
      id: req.id,
      error: errorMsg,
    }
    self.postMessage(response)
  }
}
