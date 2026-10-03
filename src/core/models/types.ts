/**
 * @fileoverview Tipos compartidos para modelos epidemiológicos SIR/SEIR/SEIS.
 * @see docs/02-modelo-matematico.md §2.1 §2.2
 */

/**
 * Función del lado derecho de un sistema ODE: dy/dt = rhs(t, y).
 * Recibe el tiempo actual y el vector de estado; retorna las derivadas.
 */
export type RHS = (t: number, y: Float64Array) => Float64Array

/**
 * Parámetros epidemiológicos del modelo.
 * @see docs/02-modelo-matematico.md §2.1
 */
export interface Params {
  /** Población total */
  N: number
  /** Tasa de transmisión β */
  beta: number
  /** Tasa de recuperación γ */
  gamma: number
  /** Tasa de progresión σ (SEIR/SEIS: tiempo promedio de incubación = 1/σ) */
  sigma?: number
  /** Tasa de parcheo preventivo ν */
  nu?: number
  /** Efectividad de segmentación c */
  c?: number
  /** Tasa de reinfección ω (SEIS: R→S) */
  omega?: number
  /** Infectados iniciales I(0) */
  i0: number
}

/**
 * Series temporales de resultado de la integración.
 * Todos los arrays tienen la misma longitud (número de pasos + 1).
 */
export interface Series {
  /** Vector de tiempos */
  t: Float64Array
  /** Susceptibles */
  S: Float64Array
  /** Expuestos (solo en modelos SEIR/SEIS) */
  E?: Float64Array
  /** Infectados */
  I: Float64Array
  /** Recuperados */
  R: Float64Array
}

/**
 * Opciones de control para los integradores numéricos.
 */
export interface SolverOpts {
  /** Paso de tiempo fijo (Euler / RK4) */
  dt?: number
  /** Tolerancia relativa (RK45 adaptativo) */
  rtol?: number
  /** Tolerancia absoluta (RK45 adaptativo) */
  atol?: number
  /** Número máximo de pasos permitidos */
  maxSteps?: number
}
