/**
 * @fileoverview Store reactivo mínimo pub/sub para el estado global de la app.
 * Sin dependencias externas. (SIR-Net Lab)
 */

import type { Params } from '../core/models/types.ts'

/** Estado global de la aplicación. */
export interface AppState {
  /** Parámetros epidemiológicos activos. */
  params: Params
  /** Método de integración numérica. */
  solver: 'euler' | 'rk4' | 'dopri5'
  /** Modelo epidemiológico activo. */
  model: 'sir' | 'seir' | 'seis'
  /** Semilla para el generador de números aleatorios. */
  seed: number
  /** Tiempo máximo de simulación (días). */
  tMax: number
  /** Paso de tiempo para solvers de paso fijo (días). */
  dt: number
}

/** Función suscriptora que recibe el nuevo estado. */
type Listener = (state: AppState) => void

/** Estado por defecto de la aplicación. */
export const DEFAULT_STATE: AppState = {
  params: {
    N: 1000,
    beta: 0.6,
    gamma: 0.2,
    sigma: 1.0,
    nu: 0,
    c: 0,
    i0: 1,
  },
  solver: 'rk4',
  model: 'sir',
  seed: 42,
  tMax: 60,
  dt: 0.1,
}

/** Interfaz pública del store reactivo. */
export interface Store {
  /** Retorna una copia del estado actual. */
  getState(): AppState
  /**
   * Fusiona un estado parcial con el actual de forma inmutable
   * y notifica a todos los suscriptores.
   */
  setState(partial: Partial<AppState>): void
  /**
   * Registra una función suscriptora.
   * @returns Función para cancelar la suscripción.
   */
  subscribe(listener: Listener): () => void
}

/**
 * Store reactivo de la aplicación.
 * Implementa el patrón pub/sub con actualizaciones inmutables.
 */
export const store: Store = ((): Store => {
  let state: AppState = { ...DEFAULT_STATE, params: { ...DEFAULT_STATE.params } }
  const listeners = new Set<Listener>()

  return {
    getState(): AppState {
      return state
    },

    /**
     * Fusiona un estado parcial con el actual de forma inmutable
     * y notifica a todos los suscriptores.
     */
    setState(partial: Partial<AppState>): void {
      state = Object.assign({}, state, partial)
      listeners.forEach((fn) => fn(state))
    },

    /**
     * Registra una función suscriptora.
     * @returns Función para cancelar la suscripción.
     */
    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
})()
