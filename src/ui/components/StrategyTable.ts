/**
 * @fileoverview Tabla comparativa accesible de métricas de estrategias de control en red.
 * Cumple con WCAG 2.1 AA (caption, th scope, formato accesible, descarga CSV).
 * (SIR-Net Lab — docs/03 RF-10 & docs/06 T5.3)
 */

import type { StrategyEvaluationReport, StrategyResult } from '../../sim/strategies.ts'

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
    <button class="btn btn--ghost btn-export-csv" type="button" aria-label="Descargar tabla comparativa en formato CSV">
      📥 Exportar CSV
    </button>
  `

  const tableWrap = document.createElement('div')
  tableWrap.className = 'table-responsive'
  tableWrap.style.cssText = 'overflow-x: auto; width: 100%;'

  const table = document.createElement('table')
  table.style.cssText =
    'width: 100%; border-collapse: collapse; font-size: var(--step--1); text-align: left;'
  table.innerHTML = `
    <caption class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;">
      Resumen de métricas de inmunización: pico, infecciones y reducción porcentual
    </caption>
    <thead>
      <tr style="border-bottom: 2px solid var(--line); background: var(--bg);">
        <th scope="col" style="padding: 10px 12px; color: var(--ink);">Estrategia</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Inmunizados</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Pico (I_max)</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Día de pico</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Brote total</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Tasa de ataque</th>
        <th scope="col" style="padding: 10px 12px; color: var(--ink); text-align: right;">Reducción</th>
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
  const btnExport = header.querySelector<HTMLButtonElement>('.btn-export-csv')

  let currentReport: StrategyEvaluationReport | null = null

  btnExport?.addEventListener('click', () => {
    if (!currentReport) return
    const rows = [
      [
        'Estrategia',
        'Inmunizados',
        'Pico (I_max)',
        'Dia de pico',
        'Brote total',
        'Tasa ataque (%)',
        'Reduccion (%)',
      ],
    ]

    const list: StrategyResult[] = Object.values(currentReport.results)
    list.forEach((r) => {
      rows.push([
        r.name,
        r.immunizedCount.toString(),
        Math.round(r.peakI).toString(),
        r.peakTime.toFixed(1),
        r.outbreakInfected.toString(),
        (r.attackRate * 100).toFixed(1) + '%',
        r.reductionPercent.toFixed(1) + '%',
      ])
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'estrategias-inmunizacion.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        <th scope="row" style="padding: 10px 12px; font-weight: 600; color: var(--ink);">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${badgeColor}; margin-right: 6px;"></span>
          ${r.name}
        </th>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono);">${r.immunizedCount}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); font-weight: bold;">${Math.round(r.peakI)}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono);">${r.peakTime.toFixed(1)} d</td>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono);">${r.outbreakInfected}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono);">${(r.attackRate * 100).toFixed(1)}%</td>
        <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); font-weight: bold; color: ${r.reductionPercent > 50 ? 'var(--ok)' : 'var(--ink)'};">
          ${r.strategy === 'none' ? '—' : `-${r.reductionPercent.toFixed(1)}%`}
        </td>
      `
      tbody.appendChild(tr)
    })
  }

  return { el: container, update }
}
