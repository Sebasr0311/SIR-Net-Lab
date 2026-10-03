import { describe, it, expect } from 'vitest'
import { nelderMead } from '../../../src/core/calibration/nelderMead.ts'
import { parseDataCsv } from '../../../src/core/calibration/dataParser.ts'
import { generateSyntheticData } from '../../../src/core/calibration/syntheticData.ts'
import { fitEpidemicModel } from '../../../src/core/calibration/fitModel.ts'
import { bootstrapResiduals } from '../../../src/core/calibration/bootstrap.ts'
import { computeCostSurface } from '../../../src/core/calibration/costSurface.ts'

describe('Calibración y estimación de parámetros (T6.1, T6.2, T6.3)', () => {
  describe('Optimizador Nelder–Mead', () => {
    it('minimiza la función parabólica 2D f(x, y) = (x - 3)² + (y + 2)² al mínimo (3, -2)', () => {
      const fn = (p: number[]) => {
        const x = p[0] ?? 0
        const y = p[1] ?? 0
        return (x - 3) * (x - 3) + (y + 2) * (y + 2)
      }

      const res = nelderMead(fn, [0, 0], { tol: 1e-6, maxIterations: 500 })
      expect(res.point[0]).toBeCloseTo(3, 2)
      expect(res.point[1]).toBeCloseTo(-2, 2)
      expect(res.cost).toBeCloseTo(0, 3)
      expect(res.converged).toBe(true)
    })

    it('respeta las cotas inferiores impuestas', () => {
      // Función con mínimo sin restricción en x = -5
      const fn = (p: number[]) => {
        const x = p[0] ?? 0
        return (x + 5) * (x + 5)
      }

      // Restricción x >= 0
      const res = nelderMead(fn, [2], { lowerBounds: [0], tol: 1e-5 })
      expect(res.point[0]).toBeGreaterThanOrEqual(-1e-4)
    })
  })

  describe('Parser y validador de datos CSV (T6.2 CA)', () => {
    it('parsea correctamente un CSV válido con encabezados', () => {
      const csv = `tiempo, infectados\n0, 1\n5, 12\n10, 85\n15, 230`
      const res = parseDataCsv(csv)
      expect(res.error).toBeUndefined()
      expect(res.data.length).toBe(4)
      expect(res.data[2]).toEqual({ t: 10, I: 85 })
    })

    it('soporta separadores por punto y coma y tabulador', () => {
      const csvSemi = `dia;casos\n1;5\n2;10\n3;25`
      const res1 = parseDataCsv(csvSemi)
      expect(res1.data.length).toBe(3)

      const csvTab = `t\tinfected\n0\t2\n10\t45\n20\t110`
      const res2 = parseDataCsv(csvTab)
      expect(res2.data.length).toBe(3)
    })

    it('rechaza entradas vacías o con menos de 3 observaciones', () => {
      expect(parseDataCsv('').error).toContain('vacío')
      expect(parseDataCsv('t,I\n1,10\n2,20').error).toContain('al menos 3')
    })

    it('rechaza valores no numéricos, negativos o tiempos no monótonos', () => {
      expect(parseDataCsv('0, 1\n5, ABC\n10, 20').error).toContain('no numéricos')
      expect(parseDataCsv('0, -1\n5, 10\n10, 20').error).toContain('no negativos')
      expect(parseDataCsv('10, 5\n5, 10\n20, 30').error).toContain('estrictamente creciente')
    })
  })

  describe('Ajuste de modelo y recuperación de parámetros (T6.1 CA)', () => {
    const trueParams = {
      N: 1000,
      beta: 0.5,
      gamma: 0.15,
      i0: 5,
    }

    it('recupera θ conocido (β, γ) a partir de datos sintéticos con error relativo < 5%', () => {
      // 1. Generar datos sintéticos limpios
      const data = generateSyntheticData({
        params: trueParams,
        tMax: 40,
        dtObs: 1.0,
        noiseSigma: 0,
        seed: 42,
      })

      expect(data.length).toBeGreaterThanOrEqual(30)

      // 2. Calibrar con conjetura inicial alejada: β0=0.35, γ0=0.25
      const fit = fitEpidemicModel({
        N: trueParams.N,
        data,
        i0: trueParams.i0,
        initialGuess: { beta: 0.35, gamma: 0.25 },
        tol: 1e-6,
      })

      // CA T6.1: Error < 5% en ambos parámetros
      const errBeta = Math.abs(fit.beta - trueParams.beta) / trueParams.beta
      const errGamma = Math.abs(fit.gamma - trueParams.gamma) / trueParams.gamma

      expect(errBeta).toBeLessThan(0.05)
      expect(errGamma).toBeLessThan(0.05)

      // Métricas de bondad de ajuste excepcionales en datos limpios
      expect(fit.r2).toBeGreaterThan(0.99)
      expect(fit.rmse).toBeLessThan(2.0)
      expect(fit.r0).toBeCloseTo(trueParams.beta / trueParams.gamma, 1)
    })
  })

  describe('Métricas, Bootstrap residual e Identificabilidad (T6.3 CA)', () => {
    const trueParams = {
      N: 1000,
      beta: 0.5,
      gamma: 0.15,
      i0: 5,
    }

    it('calcula métricas RMSE, R² e intervalos de confianza bootstrap al 95%', () => {
      // Datos sintéticos con ruido gaussiano σ=3.0
      const data = generateSyntheticData({
        params: trueParams,
        tMax: 35,
        dtObs: 1.0,
        noiseSigma: 3.0,
        seed: 123,
      })

      const fit = fitEpidemicModel({
        N: trueParams.N,
        data,
        i0: trueParams.i0,
        initialGuess: { beta: 0.45, gamma: 0.18 },
      })

      expect(fit.rmse).toBeGreaterThan(0)
      expect(fit.r2).toBeGreaterThan(0.95)

      // Bootstrap residual con 30 réplicas
      const boot = bootstrapResiduals(data, fit, trueParams.N, 30, 42)

      expect(boot.betaCi[0]).toBeLessThanOrEqual(boot.betaCi[1])
      expect(boot.gammaCi[0]).toBeLessThanOrEqual(boot.gammaCi[1])
      expect(boot.r0Ci[0]).toBeLessThanOrEqual(boot.r0Ci[1])

      // El valor verdadero debe estar dentro del intervalo o muy próximo
      expect(boot.betaCi[0]).toBeLessThan(trueParams.beta + 0.05)
      expect(boot.betaCi[1]).toBeGreaterThan(trueParams.beta - 0.05)
    })

    it('calcula la cuadrícula de la superficie de costo 2D (β vs γ)', () => {
      const data = generateSyntheticData({
        params: trueParams,
        tMax: 30,
        dtObs: 2.0,
        noiseSigma: 0,
        seed: 42,
      })

      const surface = computeCostSurface({
        data,
        N: trueParams.N,
        i0: trueParams.i0,
        betaRange: [0.3, 0.7],
        gammaRange: [0.1, 0.25],
        resolution: 10,
      })

      expect(surface.costMatrix.length).toBe(10)
      expect(surface.costMatrix[0]?.length).toBe(10)
      expect(surface.minCost).toBeLessThan(20.0)

      // El mínimo de la cuadrícula debe ser cercano al valor real
      expect(surface.bestBeta).toBeCloseTo(trueParams.beta, 1)
      expect(surface.bestGamma).toBeCloseTo(trueParams.gamma, 1)
    })
  })
})
