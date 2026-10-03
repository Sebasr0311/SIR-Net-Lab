/**
 * @fileoverview Pruebas unitarias para el módulo de Sensibilidad y Barridos (SIR-Net Lab).
 * Valida los Criterios de Aceptación T7.1, T7.2 y T7.3.
 */

import { describe, it, expect } from 'vitest'
import { computeLocalSensitivity } from '../../../src/core/sensitivity/localSensitivity.ts'
import { computeSweep2D } from '../../../src/core/sensitivity/sweep2d.ts'
import { generateLhsSamples } from '../../../src/core/sensitivity/lhs.ts'
import { runGlobalSensitivity } from '../../../src/core/sensitivity/globalSensitivity.ts'

describe('Análisis de Sensibilidad y Barridos (F7)', () => {
  const baseParams = {
    N: 1000,
    beta: 0.6,
    gamma: 0.2,
    i0: 5,
  }

  describe('Sensibilidad local normalizada e índices de elasticidad (T7.1 CA)', () => {
    it('verifica las elasticidades teóricas exactas de R₀ (S_β = +1, S_γ = -1, S_N = 0)', () => {
      const rep = computeLocalSensitivity(baseParams, 'r0')

      expect(rep.baseValue).toBeCloseTo(3.0, 4)

      const betaSens = rep.parameters.find((p) => p.param === 'beta')
      const gammaSens = rep.parameters.find((p) => p.param === 'gamma')
      const nSens = rep.parameters.find((p) => p.param === 'N')
      const i0Sens = rep.parameters.find((p) => p.param === 'i0')

      // S_beta^R0 = +1.0
      expect(betaSens?.index).toBeCloseTo(1.0, 2)
      // S_gamma^R0 = -1.0
      expect(gammaSens?.index).toBeCloseTo(-1.0, 2)
      // R0 no depende de N ni de I0 en el modelo homogéneo estándar
      expect(nSens?.index).toBeCloseTo(0.0, 2)
      expect(i0Sens?.index).toBeCloseTo(0.0, 2)
    })

    it('verifica los signos físicos del pico de infección I_max (β eleva el pico, γ lo atenúa)', () => {
      const rep = computeLocalSensitivity(baseParams, 'peakI')

      const betaSens = rep.parameters.find((p) => p.param === 'beta')
      const gammaSens = rep.parameters.find((p) => p.param === 'gamma')

      expect(betaSens?.index).toBeGreaterThan(0)
      expect(gammaSens?.index).toBeLessThan(0)

      // El ranking debe estar ordenado de mayor a menor impacto absoluto
      for (let i = 1; i < rep.parameters.length; i++) {
        expect(rep.parameters[i - 1]?.absoluteIndex).toBeGreaterThanOrEqual(
          rep.parameters[i]?.absoluteIndex ?? 0
        )
      }
    })

    it('calcula la sensibilidad de la tasa de ataque final', () => {
      const rep = computeLocalSensitivity(baseParams, 'attackRate')
      expect(rep.baseValue).toBeGreaterThan(0.5)

      const betaSens = rep.parameters.find((p) => p.param === 'beta')
      expect(betaSens?.index).toBeGreaterThan(0)
    })

    it('calcula la sensibilidad del tiempo al pico (t_pico)', () => {
      const rep = computeLocalSensitivity(baseParams, 'peakTime')
      expect(rep.baseValue).toBeGreaterThan(0)

      // Un beta mayor hace que el pico ocurra más temprano (sensibilidad negativa)
      const betaSens = rep.parameters.find((p) => p.param === 'beta')
      expect(betaSens?.index).toBeLessThan(0)
    })
  })

  describe('Barrido 2D y bifurcación transcrítica R₀=1 (T7.2 CA)', () => {
    it('genera la cuadrícula 2D y confirma la transición en la línea β = γ (R₀ = 1)', () => {
      const sweep = computeSweep2D({
        N: 1000,
        i0: 5,
        betaRange: [0.1, 0.8],
        gammaRange: [0.1, 0.8],
        resolution: 8,
      })

      expect(sweep.peakMatrix.length).toBe(8)
      expect(sweep.peakMatrix[0]?.length).toBe(8)
      expect(sweep.thresholdLine.length).toBeGreaterThan(0)

      // Verificar que en la línea de umbral beta === gamma
      for (const pt of sweep.thresholdLine) {
        expect(pt.beta).toBeCloseTo(pt.gamma, 4)
      }

      // Con beta = 0.1 y gamma = 0.8 (R0 = 0.125 < 1), el pico debe ser i0 (sin brote)
      // beta está en filas, gamma en columnas
      const subcriticalPeak = sweep.peakMatrix[0]?.[7] ?? 0
      expect(subcriticalPeak).toBe(5)

      // Con beta = 0.8 y gamma = 0.1 (R0 = 8 >> 1), el pico debe ser grande (> 400)
      const supercriticalPeak = sweep.peakMatrix[7]?.[0] ?? 0
      expect(supercriticalPeak).toBeGreaterThan(400)
    })
  })

  describe('Muestreo por Hipercubo Latino y Sensibilidad Global (T7.3 CA)', () => {
    it('genera muestras LHS uniformemente estratificadas y reproducibles', () => {
      const ranges = [
        { name: 'beta', min: 0.2, max: 0.8 },
        { name: 'gamma', min: 0.1, max: 0.4 },
      ]

      const nSamples = 50
      const samples1 = generateLhsSamples(ranges, nSamples, 123)
      const samples2 = generateLhsSamples(ranges, nSamples, 123)

      expect(samples1.length).toBe(nSamples)
      expect(samples1).toEqual(samples2)

      // Cada muestra debe respetar los rangos
      for (const s of samples1) {
        expect(s.beta).toBeGreaterThanOrEqual(0.2)
        expect(s.beta).toBeLessThanOrEqual(0.8)
        expect(s.gamma).toBeGreaterThanOrEqual(0.1)
        expect(s.gamma).toBeLessThanOrEqual(0.4)
      }
    })

    it('ejecuta el análisis global GSA y calcula distribuciones, cuantiles y correlaciones', () => {
      const ranges = [
        { name: 'beta', min: 0.3, max: 0.9 },
        { name: 'gamma', min: 0.1, max: 0.3 },
      ]

      const result = runGlobalSensitivity({
        N: 1000,
        i0: 2,
        ranges,
        sampleCount: 200,
        seed: 42,
      })

      expect(result.sampleCount).toBe(200)
      expect(result.outbreakProbability).toBeGreaterThan(0.8) // la mayoría tiene R0 > 1 en este rango
      expect(result.peakIDist.p5).toBeLessThanOrEqual(result.peakIDist.median)
      expect(result.peakIDist.median).toBeLessThanOrEqual(result.peakIDist.p95)
      expect(result.peakIDist.histogram.length).toBe(20)

      // Correlación de beta con el pico debe ser positiva
      const betaCorr = result.correlations.find((c) => c.param === 'beta')
      const gammaCorr = result.correlations.find((c) => c.param === 'gamma')

      expect(betaCorr?.correlationWithPeak).toBeGreaterThan(0.4)
      expect(gammaCorr?.correlationWithPeak).toBeLessThan(-0.3)
    })
  })
})
