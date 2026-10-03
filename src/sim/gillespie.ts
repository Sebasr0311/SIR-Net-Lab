/**
 * @fileoverview Simulación estocástica continua de Gillespie sobre grafos (SIR / SEIR).
 * Implementa un algoritmo de eventos exacto con mantenimiento O(grado) de propensiones.
 * (SIR-Net Lab — docs/02 §2.3, RF-07 & T4.2)
 */

import { createRng } from '../core/rng.ts'
import type { Graph } from './graphs/types.ts'

export const NODE_STATE = {
  SUSCEPTIBLE: 0,
  EXPOSED: 1,
  INFECTIOUS: 2,
  RECOVERED: 3,
} as const

export type NodeState = (typeof NODE_STATE)[keyof typeof NODE_STATE]

export interface GillespieParams {
  graph: Graph
  /** Tasa de transmisión por contacto efectivo. β_e = beta / ⟨k⟩ */
  beta: number
  /** Tasa de recuperación / aislamiento γ */
  gamma: number
  /** Tasa de transición de latencia σ (si no se especifica o <= 0, es SIR directo) */
  sigma?: number
  /** Cantidad de nodos infectados inicialmente (default 1) */
  i0?: number
  /** Nodos específicos a infectar al inicio (opcional) */
  initialSeeds?: number[]
  /** Tiempo máximo de simulación */
  tMax?: number
  /** Intervalo de muestreo para la serie temporal */
  dt?: number
  /** Semilla del generador pseudoaleatorio */
  seed?: number
  /** Si debe registrar instantáneas de estados de nodos para animación */
  recordHistory?: boolean
}

export interface GillespieResult {
  t: Float64Array
  S: Float64Array
  E?: Float64Array
  I: Float64Array
  R: Float64Array
  /** Instantáneas registradas para animación: [tiempo, estados] */
  history?: Array<{ t: number; states: Uint8Array }>
  totalInfected: number
  duration: number
}

/**
 * Ejecuta una simulación estocástica exacta de Gillespie sobre el grafo.
 */
export function simulateGillespie(params: GillespieParams): GillespieResult {
  const {
    graph,
    beta,
    gamma,
    sigma = 0,
    i0 = 1,
    initialSeeds,
    tMax = 60,
    dt = 0.2,
    seed = 42,
    recordHistory = false,
  } = params

  const { n, adj } = graph
  if (n === 0) {
    return {
      t: new Float64Array(0),
      S: new Float64Array(0),
      I: new Float64Array(0),
      R: new Float64Array(0),
      totalInfected: 0,
      duration: 0,
    }
  }

  const rng = createRng(seed)
  const isSeir = sigma > 0

  // Cálculo de grado medio para normalizar beta por enlace
  let sumK = 0
  for (let i = 0; i < n; i++) {
    sumK += adj[i]?.length ?? 0
  }
  const meanK = sumK / n
  // β_e: tasa por arista S-I
  const betaE = meanK > 0 ? beta / meanK : beta / Math.max(1, n - 1)

  // Estados de cada nodo: 0: S, 1: E, 2: I, 3: R
  const states = new Uint8Array(n) // todos en S inicialmente

  // Contadores de infectados vecinos para cada nodo susceptible
  const infectedNeighbors = new Uint32Array(n)

  // Conjuntos activos para muestreo rápido
  const exposedNodes = new Set<number>()
  const infectiousNodes = new Set<number>()

  // Lista de nodos susceptibles con al menos un vecino infectado
  // (propensión > 0 a infectarse)
  const atRiskSusceptibles = new Set<number>()

  let sCount = n
  let eCount = 0
  let iCount = 0
  let rCount = 0

  // Sembrado inicial de infección
  const seedsToInfect: number[] = []
  if (initialSeeds && initialSeeds.length > 0) {
    seedsToInfect.push(...initialSeeds.filter((idx) => idx >= 0 && idx < n))
  } else {
    // Escoger i0 nodos aleatorios
    const count = Math.min(n, Math.max(1, i0))
    const perm: number[] = Array.from({ length: n }, (_, i) => i)
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(rng() * (n - i))
      const temp = perm[i] ?? 0
      perm[i] = perm[j] ?? 0
      perm[j] = temp
      seedsToInfect.push(perm[i] ?? 0)
    }
  }

  seedsToInfect.forEach((seedNode) => {
    states[seedNode] = NODE_STATE.INFECTIOUS
    infectiousNodes.add(seedNode)
    sCount--
    iCount++

    // Actualizar vecinos
    const neighbors = adj[seedNode]
    if (neighbors) {
      for (let k = 0; k < neighbors.length; k++) {
        const u = neighbors[k]
        if (u !== undefined && states[u] === NODE_STATE.SUSCEPTIBLE) {
          infectedNeighbors[u]++
          atRiskSusceptibles.add(u)
        }
      }
    }
  })

  // Estructuras para guardar series temporales muestreadas a intervalos dt
  const sampleTimes: number[] = []
  const sampleS: number[] = []
  const sampleE: number[] = []
  const sampleI: number[] = []
  const sampleR: number[] = []
  const history: Array<{ t: number; states: Uint8Array }> = []

  let nextSampleTime = 0
  let currentTime = 0

  function recordSample(time: number): void {
    sampleTimes.push(time)
    sampleS.push(sCount)
    if (isSeir) sampleE.push(eCount)
    sampleI.push(iCount)
    sampleR.push(rCount)

    if (recordHistory) {
      history.push({ t: time, states: new Uint8Array(states) })
    }
  }

  // Muestra inicial en t = 0
  recordSample(0)
  nextSampleTime += dt

  // Bucle principal de Gillespie
  while (currentTime < tMax && (iCount > 0 || eCount > 0)) {
    // 1. Calcular propensiones totales
    // Tasa de transmisión total = β_e * (aristas S-I)
    let totalTransmissionRate = 0
    atRiskSusceptibles.forEach((u) => {
      totalTransmissionRate += (infectedNeighbors[u] ?? 0) * betaE
    })

    // Tasa de latencia total = σ * E
    const totalLatencyRate = isSeir ? eCount * sigma : 0

    // Tasa de recuperación total = γ * I
    const totalRecoveryRate = iCount * gamma

    const totalRate = totalTransmissionRate + totalLatencyRate + totalRecoveryRate
    if (totalRate <= 0) break

    // 2. Tiempo al siguiente evento: τ ~ Exponencial(totalRate)
    const u1 = rng()
    const safeU1 = u1 <= 0 ? 1e-12 : u1 >= 1 ? 1 - 1e-12 : u1
    const tau = -Math.log(safeU1) / totalRate

    // Muestreo de series en puntos intermedios antes de que avance el tiempo
    while (nextSampleTime <= currentTime + tau && nextSampleTime <= tMax) {
      recordSample(nextSampleTime)
      nextSampleTime += dt
    }

    currentTime += tau
    if (currentTime > tMax) break

    // 3. Determinar qué evento ocurre
    const u2 = rng() * totalRate

    if (u2 < totalTransmissionRate) {
      // Evento: Transmisión (un nodo susceptible pasa a E o a I)
      let cum = 0
      let chosenSusceptible = -1
      for (const u of atRiskSusceptibles) {
        cum += (infectedNeighbors[u] ?? 0) * betaE
        if (u2 <= cum) {
          chosenSusceptible = u
          break
        }
      }

      if (chosenSusceptible !== -1) {
        atRiskSusceptibles.delete(chosenSusceptible)
        sCount--

        if (isSeir) {
          // Pasa a Expuesto (E)
          states[chosenSusceptible] = NODE_STATE.EXPOSED
          exposedNodes.add(chosenSusceptible)
          eCount++
        } else {
          // Pasa directamente a Infectado (I)
          states[chosenSusceptible] = NODE_STATE.INFECTIOUS
          infectiousNodes.add(chosenSusceptible)
          iCount++

          // Notificar a vecinos susceptibles
          const neighbors = adj[chosenSusceptible]
          if (neighbors) {
            for (let k = 0; k < neighbors.length; k++) {
              const v = neighbors[k]
              if (v !== undefined && states[v] === NODE_STATE.SUSCEPTIBLE) {
                infectedNeighbors[v]++
                atRiskSusceptibles.add(v)
              }
            }
          }
        }
      }
    } else if (u2 < totalTransmissionRate + totalLatencyRate) {
      // Evento: Fin de latencia (E -> I)
      const exposedArray = Array.from(exposedNodes)
      const randIdx = Math.floor(rng() * exposedArray.length)
      const chosenE = exposedArray[randIdx]

      if (chosenE !== undefined) {
        exposedNodes.delete(chosenE)
        eCount--
        states[chosenE] = NODE_STATE.INFECTIOUS
        infectiousNodes.add(chosenE)
        iCount++

        // Ahora propaga a sus vecinos
        const neighbors = adj[chosenE]
        if (neighbors) {
          for (let k = 0; k < neighbors.length; k++) {
            const v = neighbors[k]
            if (v !== undefined && states[v] === NODE_STATE.SUSCEPTIBLE) {
              infectedNeighbors[v]++
              atRiskSusceptibles.add(v)
            }
          }
        }
      }
    } else {
      // Evento: Recuperación / limpieza (I -> R)
      const infectiousArray = Array.from(infectiousNodes)
      const randIdx = Math.floor(rng() * infectiousArray.length)
      const chosenI = infectiousArray[randIdx]

      if (chosenI !== undefined) {
        infectiousNodes.delete(chosenI)
        iCount--
        states[chosenI] = NODE_STATE.RECOVERED
        rCount++

        // Decrementar infectados vecinos para sus vecinos susceptibles
        const neighbors = adj[chosenI]
        if (neighbors) {
          for (let k = 0; k < neighbors.length; k++) {
            const v = neighbors[k]
            if (v !== undefined && states[v] === NODE_STATE.SUSCEPTIBLE) {
              if (infectedNeighbors[v] > 0) {
                infectedNeighbors[v]--
              }
              if (infectedNeighbors[v] === 0) {
                atRiskSusceptibles.delete(v)
              }
            }
          }
        }
      }
    }
  }

  // Rellenar muestras restantes hasta tMax si la epidemia se extinguió antes
  while (nextSampleTime <= tMax) {
    recordSample(nextSampleTime)
    nextSampleTime += dt
  }

  const result: GillespieResult = {
    t: new Float64Array(sampleTimes),
    S: new Float64Array(sampleS),
    I: new Float64Array(sampleI),
    R: new Float64Array(sampleR),
    totalInfected: n - sCount,
    duration: currentTime,
  }

  if (isSeir) {
    result.E = new Float64Array(sampleE)
  }

  if (recordHistory) {
    result.history = history
  }

  return result
}
