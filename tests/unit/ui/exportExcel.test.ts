/**
 * @fileoverview Pruebas unitarias para el módulo de exportación a Excel y CSV (T3.6).
 */

import { describe, it, expect } from 'vitest'
import {
  buildExcelSpreadsheetXml,
  buildStructuredCsv,
  buildStrategyExcelSpreadsheetXml,
} from '../../../src/ui/exportExcel.ts'

describe('Exportador profesional de Excel (.xls) y CSV', () => {
  const dummySeries = {
    t: new Float64Array([0, 1, 2, 3]),
    S: new Float64Array([990, 950, 850, 700]),
    I: new Float64Array([10, 50, 150, 290]),
    R: new Float64Array([0, 0, 0, 10]),
  }

  const dummyMeta = {
    model: 'SIR',
    solver: 'RK4',
    beta: 0.6,
    gamma: 0.2,
    i0: 10,
    dt: 0.1,
    r0: 3.0,
    peakI: 300,
    peakTime: 18.5,
    criticalCoverage: 66.67,
    finalAttackRate: 0.94,
  }

  it('genera una plantilla Excel (.xls) válida con metadatos y hojas de cálculo', () => {
    const xml = buildExcelSpreadsheetXml(dummySeries, 3.0, 1000, dummyMeta)

    expect(xml).toContain('xmlns:x="urn:schemas-microsoft-com:office:excel"')
    expect(xml).toContain('SIR-Net Lab · Reporte de Simulación Epidemiológica')
    expect(xml).toContain('Población Total (N):')
    expect(xml).toContain('1000')
    expect(xml).toContain('Número Reproductivo Básico (R₀):')
    expect(xml).toContain('3.000')
    expect(xml).toContain('Pico Máximo de Infección (I_max):')
    expect(xml).toContain('S(t) [Susceptibles]')
    expect(xml).toContain('R_ef(t) [Efectivo]')
  })

  it('soporta modelos SEIR incorporando la columna de Expuestos (E)', () => {
    const seirSeries = {
      ...dummySeries,
      E: new Float64Array([0, 20, 50, 80]),
    }
    const xml = buildExcelSpreadsheetXml(seirSeries, 3.0, 1000, {
      ...dummyMeta,
      model: 'SEIR',
      sigma: 1.0,
    })

    expect(xml).toContain('E(t) [Expuestos]')
    expect(xml).toContain('Tasa de Latencia (σ):')
  })

  it('genera un CSV estructurado con UTF-8 BOM y bloque de metadatos', () => {
    const csv = buildStructuredCsv(dummySeries, 3.0, 1000, dummyMeta)

    expect(csv.startsWith('\uFEFF#')).toBe(true)
    expect(csv).toContain('# SIR-Net Lab — Reporte de Simulación Epidemiológica')
    expect(csv).toContain('t_dias,S_susceptibles,I_infectados,R_recuperados,N_total,R_ef')
    expect(csv).toContain('0.00,990.00,10.00,0.00,1000.00,2.970')
  })

  it('genera la plantilla Excel para la comparativa de estrategias de control en red', () => {
    const report = {
      topology: 'Barabási–Albert (Escala Libre)',
      results: {
        hubs: {
          name: 'Inmunización de Hubs',
          immunizedCount: 50,
          peakI: 35.2,
          peakTime: 22.0,
          outbreakInfected: 120,
          attackRate: 0.12,
          reductionPercent: 78.5,
        },
      },
    }

    const xml = buildStrategyExcelSpreadsheetXml(report)
    expect(xml).toContain('SIR-Net Lab · Comparativa de Estrategias de Inmunización')
    expect(xml).toContain('Barabási–Albert (Escala Libre)')
    expect(xml).toContain('Inmunización de Hubs')
    expect(xml).toContain('0.785')
  })
})
