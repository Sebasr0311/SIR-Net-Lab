/**
 * @fileoverview Tabla comparativa accesible de métricas de estrategias de control en red.
 * Cumple con WCAG 2.1 AA (caption, th scope, formato accesible, descarga CSV).
 * (SIR-Net Lab — docs/03 RF-10 & docs/06 T5.3)
 */

import type { StrategyEvaluationReport, StrategyResult } from '../../sim/strategies.ts'
import {
  buildStrategyExcelSpreadsheetXml,
  triggerExcelDownload,
  triggerCsvDownload,
} from '../exportExcel.ts'

export interface StrategyTableHandle {
  el: HTMLElement
  update: (report: StrategyEvaluationReport) => void
}

export function createStrategyTable(): StrategyTableHandle {
  const container = document.createElement('div')
  container.className = 'card strategy-table-card'
  container.setAttribute('data-component', 'strategy-table')

  const header = document.createElement('div')
  header.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  header.innerHTML = `
    <div>
      <h3 style="font-size: var(--step-0); margin: 0;">Métricas de contención por estrategia</h3>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Comparación de impacto sobre la población susceptible
      </p>
    </div>
    <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
      <button class="btn btn--secondary btn-export-excel" type="button" aria-label="Descargar tabla comparativa en formato Excel">
        📊 Exportar Excel (.xls)
      </button>
      <button class="btn btn--ghost btn-export-csv" type="button" aria-label="Descargar tabla comparativa en formato CSV">
        📥 Exportar CSV
      </button>
    </div>
  `

  const tableWrap = document.createElement('div')
  tableWrap.className = 'table-responsive table-container'
  tableWrap.style.cssText =
    'overflow-x: auto; width: 100%; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface);'

  const table = document.createElement('table')
  table.style.cssText =
    'width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--step--1); text-align: left;'
  table.innerHTML = `
    <caption class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">
      Resumen de métricas de inmunización: pico, infecciones y reducción porcentual
    </caption>
    <thead>
      <tr style="border-bottom: 1px solid var(--line); background: var(--bg);">
        <th scope="col" style="padding: 10px 14px; color: var(--ink); white-space: nowrap; border-bottom: 1px solid var(--line);">Estrategia</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Inmunizados</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Pico (I_max)</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Día de pico</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Brote total</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Tasa de ataque</th>
        <th scope="col" style="padding: 10px 14px; color: var(--ink); text-align: right; white-space: nowrap; border-bottom: 1px solid var(--line);">Reducción</th>
      </tr>
    </thead>
    <tbody class="strategy-table-body">
      <tr>
        <td colspan="7" style="padding: 16px; text-align: center; color: var(--ink-2);">
          Presiona "Ejecutar evaluación de estrategias" para calcular los resultados.
        </td>
      </tr>
    </tbody>
  `

  tableWrap.appendChild(table)
  container.appendChild(header)
  container.appendChild(tableWrap)

  const tbody = table.querySelector<HTMLTableSectionElement>('.strategy-table-body')
  const btnExportExcel = header.querySelector<HTMLButtonElement>('.btn-export-excel')
  const btnExportCsv = header.querySelector<HTMLButtonElement>('.btn-export-csv')

  let currentReport: StrategyEvaluationReport | null = null

  btnExportExcel?.addEventListener('click', () => {
    if (!currentReport) return
    const xml = buildStrategyExcelSpreadsheetXml(currentReport)
    triggerExcelDownload(xml, 'estrategias-inmunizacion.xls')
  })

  btnExportCsv?.addEventListener('click', () => {
    if (!currentReport) return
    const rows = [
      '\uFEFF# SIR-Net Lab — Evaluación de Estrategias de Inmunización',
      `# Fecha: ${new Date().toISOString()}`,
      `# Topologia: ${currentReport.topology ?? 'Red Compleja'}`,
      'Estrategia,Inmunizados,Pico_I_max,Dia_pico,Brote_total,Tasa_ataque_pct,Reduccion_pct',
    ]

    const list: StrategyResult[] = Object.values(currentReport.results)
    list.forEach((r) => {
      rows.push(
        `"${r.name}",${r.immunizedCount},${r.peakI.toFixed(1)},${r.peakTime.toFixed(1)},${r.outbreakInfected},${(r.attackRate * 100).toFixed(1)}%,${r.reductionPercent.toFixed(1)}%`
      )
    })

    triggerCsvDownload(rows.join('\r\n'), 'estrategias-inmunizacion.csv')
  })

  function update(report: StrategyEvaluationReport): void {
    currentReport = report
    if (!tbody) return

    const list: StrategyResult[] = Object.values(report.results)
    if (list.length === 0) return

    tbody.innerHTML = ''

    list.forEach((r, idx) => {
      const tr = document.createElement('tr')
      tr.style.cssText = `border-bottom: 1px solid var(--line); ${idx % 2 === 1 ? 'background: rgba(0,0,0,0.02);' : ''}`

      const badgeColor =
        r.strategy === 'hubs'
          ? 'var(--ok)'
          : r.strategy === 'acquaintance'
            ? 'var(--accent)'
            : r.strategy === 'random'
              ? 'var(--warn)'
              : 'var(--ink-2)'

      tr.innerHTML = `
        <th scope="row" style="padding: 10px 14px; font-weight: 600; color: var(--ink); white-space: nowrap; border-bottom: 1px solid var(--line);">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${badgeColor}; margin-right: 6px;"></span>
          ${r.name}
        </th>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; border-bottom: 1px solid var(--line);">${r.immunizedCount}</td>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: bold; white-space: nowrap; border-bottom: 1px solid var(--line);">${Math.round(r.peakI)}</td>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; border-bottom: 1px solid var(--line);">${r.peakTime.toFixed(1)} d</td>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; border-bottom: 1px solid var(--line);">${r.outbreakInfected}</td>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; white-space: nowrap; border-bottom: 1px solid var(--line);">${(r.attackRate * 100).toFixed(1)}%</td>
        <td style="padding: 10px 14px; text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; font-weight: bold; white-space: nowrap; border-bottom: 1px solid var(--line); color: ${r.reductionPercent > 50 ? 'var(--ok)' : 'var(--ink)'};">
          ${r.strategy === 'none' ? '—' : `-${r.reductionPercent.toFixed(1)}%`}
        </td>
      `
      tbody.appendChild(tr)
    })
  }

  return { el: container, update }
}
