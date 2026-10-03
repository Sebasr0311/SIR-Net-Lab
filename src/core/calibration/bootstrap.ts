/**
 * @fileoverview Bootstrap residual para cálculo de intervalos de confianza de parámetros calibrados.
 * Remuestrea los residuos centrados con reemplazo para generar réplicas sintéticas y estimar
 * la incertidumbre paramétrica (intervalos de confianza al 95% de β, γ y R₀).
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.3
 */

import { createRng } from '../rng.ts'
import type { Observation } from './syntheticData.ts'
import { fitEpidemicModel, type CalibrationResult } from './fitModel.ts'

export interface BootstrapResult {
  betaCi: [number, number]
  gammaCi: [number, number]
  r0Ci: [number, number]
  replicas: Array<{ beta: number; gamma: number; r0: number }>
}

/**
 * Calcula el cuantil q ∈ [0, 1] de un array numérico ordenado.
 */
function quantile(sorted: number[], q: number): number {
  const n = sorted.length
  if (n === 0) return 0
  const pos = (n - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const val0 = sorted[base] ?? 0
  const val1 = sorted[base + 1] ?? val0
  return val0 + rest * (val1 - val0)
}

/**
 * Ejecuta bootstrap residual sobre los resultados de calibración.
 */
export function bootstrapResiduals(
  data: Observation[],
  calibration: CalibrationResult,
  N: number,
  nReplicas: number = 80,
  seed: number = 42
): BootstrapResult {
  const rng = createRng(seed)
  const m = data.length
  const residuals = calibration.residuals

  // Centrar residuos para asegurar media cero
  let sumRes = 0
  for (let i = 0; i < residuals.length; i++) {
    sumRes += residuals[i] ?? 0
  }
  const meanRes = sumRes / m
  const centeredRes = residuals.map((r) => r - meanRes)

  const betaList: number[] = []
  const gammaList: number[] = []
  const r0List: number[] = []
  const replicas: Array<{ beta: number; gamma: number; r0: number }> = []

  for (let rep = 0; rep < nReplicas; rep++) {
    // Generar datos sintéticos remuestreando residuos
    const repData: Observation[] = []
    for (let i = 0; i < m; i++) {
      const obs = data[i]
      if (!obs) continue

      // Índice de residuo aleatorio
      const randIdx = Math.floor(rng() * centeredRes.length)
      const sampledRes = centeredRes[randIdx] ?? 0
      const fittedY = obs.I - (residuals[i] ?? 0)
      const noisyY = Math.max(0, Math.round(fittedY + sampledRes))

      repData.push({ t: obs.t, I: noisyY })
    }

    // Ajustar con tolerancia relajada para velocidad
    try {
      const repFit = fitEpidemicModel({
        N,
        data: repData,
        i0: calibration.i0,
        initialGuess: { beta: calibration.beta, gamma: calibration.gamma },
        tol: 1e-4,
        maxIterations: 200,
      })

      betaList.push(repFit.beta)
      gammaList.push(repFit.gamma)
      r0List.push(repFit.r0)
      replicas.push({ beta: repFit.beta, gamma: repFit.gamma, r0: repFit.r0 })
    } catch {
      // Si alguna réplica aislada falla, continuar
    }
  }

  // Si todas las réplicas fallaron por algún motivo inesperado, usar valor puntual
  if (betaList.length === 0) {
    return {
      betaCi: [calibration.beta, calibration.beta],
      gammaCi: [calibration.gamma, calibration.gamma],
      r0Ci: [calibration.r0, calibration.r0],
      replicas: [],
    }
  }

  betaList.sort((a, b) => a - b)
  gammaList.sort((a, b) => a - b)
  r0List.sort((a, b) => a - b)

  const betaCi: [number, number] = [quantile(betaList, 0.025), quantile(betaList, 0.975)]
  const gammaCi: [number, number] = [quantile(gammaList, 0.025), quantile(gammaList, 0.975)]
  const r0Ci: [number, number] = [quantile(r0List, 0.025), quantile(r0List, 0.975)]

  return {
    betaCi,
    gammaCi,
    r0Ci,
    replicas,
  }
}
