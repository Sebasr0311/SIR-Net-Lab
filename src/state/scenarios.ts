/**
 * @fileoverview Escenarios predefinidos para SIR-Net Lab.
 * Definidos en docs/02-modelo-matematico.md §2.8.
 */

import type { AppState } from './store.ts'

export interface ScenarioDefinition {
  id: string
  name: string
  description: string
  r0Description: string
  state: AppState
}

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  'gusano-red-local': {
    id: 'gusano-red-local',
    name: 'Gusano de red local',
    description:
      'Propagación rápida en red corporativa homogénea sin medidas de aislamiento inmediatas.',
    r0Description: 'R₀ = 3.0 (brote epidémico acelerado)',
    state: {
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
    },
  },
  'ransomware-latencia': {
    id: 'ransomware-latencia',
    name: 'Ransomware con latencia',
    description:
      'Ataque con fase de incubación latente (fase expuesta prolongada) antes del cifrado masivo.',
    r0Description: 'R₀ = 3.0 con retraso temporal visible por latencia',
    state: {
      params: {
        N: 5000,
        beta: 0.45,
        gamma: 0.15,
        sigma: 0.5,
        nu: 0,
        c: 0,
        i0: 5,
      },
      solver: 'rk4',
      model: 'seir',
      seed: 42,
      tMax: 90,
      dt: 0.1,
    },
  },
  'brote-contenido': {
    id: 'brote-contenido',
    name: 'Brote contenido',
    description:
      'Transmisión baja o contención temprana donde la recuperación/parcheo supera la tasa de infección.',
    r0Description: 'R₀ = 0.75 (extinción natural del brote)',
    state: {
      params: {
        N: 1000,
        beta: 0.15,
        gamma: 0.2,
        sigma: 1.0,
        nu: 0,
        c: 0,
        i0: 5,
      },
      solver: 'rk4',
      model: 'sir',
      seed: 42,
      tMax: 60,
      dt: 0.1,
    },
  },
  'desinformacion-red': {
    id: 'desinformacion-red',
    name: 'Desinformación en red social',
    description:
      'Difusión viral a gran escala con alta tasa de contagio y rápido paso a la fase activa.',
    r0Description: 'R₀ = 5.0 (alta transmisibilidad en masa)',
    state: {
      params: {
        N: 10000,
        beta: 0.5,
        gamma: 0.1,
        sigma: 2.0,
        nu: 0,
        c: 0,
        i0: 10,
      },
      solver: 'rk4',
      model: 'seir',
      seed: 42,
      tMax: 60,
      dt: 0.1,
    },
  },
}
