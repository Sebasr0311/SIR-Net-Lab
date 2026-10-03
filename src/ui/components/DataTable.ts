/**
 * @fileoverview Tabla de datos accesible y exportador CSV para las series temporales.
 * Cumple RNF-04 (alternativa textual con caption y headers accesibles) y T3.6.
 * (SIR-Net Lab)
 */

import type { TimeChartSeries } from './TimeChart.ts'
import {
  buildExcelSpreadsheetXml,
  buildStructuredCsv,
  triggerExcelDownload,
  triggerCsvDownload,
  type SimulationExportMeta,
} from '../exportExcel.ts'

export interface DataTableHandle {
  el: HTMLElement
  update: (series: TimeChartSeries, r0: number, N: number, meta?: SimulationExportMeta) => void
}

export function createDataTable(): DataTableHandle {
  const container = document.createElement('div')
  container.className = 'card data-table-card'
  container.setAttribute('data-component', 'data-table')

  container.innerHTML = `
    <div class="data-table-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-2);">
      <div>
        <h2 style="font-size: var(--step-1);">Datos de la simulación</h2>
        <p class="text-muted" style="font-size: var(--step--1); color: var(--ink-2);">Tabla accesible y exportación de datos crudos</p>
      </div>
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
        <button class="btn btn--ghost btn-toggle-table" type="button" aria-expanded="false">
          👁 Ver tabla de datos
        </button>
        <button class="btn btn--secondary btn-download-excel" type="button" title="Descargar reporte con plantilla completa para Microsoft Excel">
          📊 Descargar Excel (.xls)
        </button>
        <button class="btn btn--ghost btn-download-csv" type="button" title="Descargar datos en formato CSV con metadatos UTF-8">
          📥 Descargar CSV
        </button>
      </div>
    </div>
    <div class="data-table-wrap table-responsive" style="display: none; overflow-x: auto; max-height: 360px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface);">
      <table class="accessible-table" style="width: 100%; border-collapse: separate; border-spacing: 0; font-family: var(--font-mono); font-size: var(--step--1);">
        <caption style="text-align: left; padding: 10px 14px; font-weight: 600; font-family: var(--font-ui); color: var(--ink-2); border-bottom: 1px solid var(--line);">
          Valores calculados de la población por compartimento en función del tiempo
        </caption>
        <thead>
          <tr style="position: sticky; top: 0; z-index: 2; background: var(--bg); text-align: right; box-shadow: 0 1px 0 var(--line);">
            <th scope="col" style="padding: 10px 14px; text-align: left; white-space: nowrap; border-bottom: 1px solid var(--line);">t (días)</th>
            <th scope="col" style="padding: 10px 14px; color: var(--S); white-space: nowrap; border-bottom: 1px solid var(--line);">S (Susceptibles)</th>
            <th scope="col" style="padding: 10px 14px; color: var(--E); white-space: nowrap; border-bottom: 1px solid var(--line);" class="col-e">E (Expuestos)</th>
            <th scope="col" style="padding: 10px 14px; color: var(--I); white-space: nowrap; border-bottom: 1px solid var(--line);">I (Infectados)</th>
            <th scope="col" style="padding: 10px 14px; color: var(--R); white-space: nowrap; border-bottom: 1px solid var(--line);">R (Recuperados)</th>
            <th scope="col" style="padding: 10px 14px; white-space: nowrap; border-bottom: 1px solid var(--line);">R_ef</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <!-- Se llena dinámicamente -->
        </tbody>
      </table>
    </div>
  `

  const btnToggle = container.querySelector<HTMLButtonElement>('.btn-toggle-table')
  const btnExcel = container.querySelector<HTMLButtonElement>('.btn-download-excel')
  const btnCsv = container.querySelector<HTMLButtonElement>('.btn-download-csv')
  const tableWrap = container.querySelector<HTMLElement>('.data-table-wrap')
  const tbody = container.querySelector<HTMLTableSectionElement>('.table-body')
  const colE = container.querySelector<HTMLTableCellElement>('.col-e')

  let currentSeries: TimeChartSeries | null = null
  let currentR0 = 3
  let currentN = 1000
  let currentMeta: SimulationExportMeta | undefined = undefined

  if (btnToggle && tableWrap) {
    btnToggle.addEventListener('click', () => {
      const isVisible = tableWrap.style.display !== 'none'
      tableWrap.style.display = isVisible ? 'none' : 'block'
      btnToggle.setAttribute('aria-expanded', String(!isVisible))
      btnToggle.textContent = isVisible ? '👁 Ver tabla de datos' : '✕ Ocultar tabla de datos'
    })
  }

  if (btnExcel) {
    btnExcel.addEventListener('click', () => {
      if (!currentSeries || currentSeries.t.length === 0) return
      const xml = buildExcelSpreadsheetXml(currentSeries, currentR0, currentN, currentMeta)
      triggerExcelDownload(xml, 'sir-net-lab-simulacion.xls')
    })
  }

  if (btnCsv) {
    btnCsv.addEventListener('click', () => {
      if (!currentSeries || currentSeries.t.length === 0) return
      const csv = buildStructuredCsv(currentSeries, currentR0, currentN, currentMeta)
      triggerCsvDownload(csv, 'sir-net-lab-series.csv')
    })
  }

  function update(
    series: TimeChartSeries,
    r0: number,
    N: number,
    meta?: SimulationExportMeta
  ): void {
    currentSeries = series
    currentR0 = r0
    currentN = N
    currentMeta = meta

    if (!tbody) return
    tbody.innerHTML = ''

    const hasE = Boolean(series.E && series.E.length > 0)
    if (colE) {
      colE.style.display = hasE ? '' : 'none'
    }

    // Submuestrear para renderizar ~25 filas en pantalla
    const step = Math.max(1, Math.floor(series.t.length / 25))

    for (let i = 0; i < series.t.length; i += step) {
      const tVal = series.t[i] ?? 0
      const sVal = series.S[i] ?? 0
      const iVal = series.I[i] ?? 0
      const rVal = series.R[i] ?? 0
      const rEff = ((r0 * sVal) / N).toFixed(2)

      const tr = document.createElement('tr')
      tr.style.cssText = 'border-bottom: 1px solid var(--line);'

      let html = `
        <td style="padding: 10px 14px; text-align: left; white-space: nowrap; font-variant-numeric: tabular-nums;">${tVal.toFixed(1)}</td>
        <td style="padding: 10px 14px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;">${Math.round(sVal)}</td>
      `
      if (hasE && series.E) {
        const eVal = series.E[i] ?? 0
        html += `<td style="padding: 10px 14px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;">${Math.round(eVal)}</td>`
      }
      html += `
        <td style="padding: 10px 14px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;">${Math.round(iVal)}</td>
        <td style="padding: 10px 14px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;">${Math.round(rVal)}</td>
        <td style="padding: 10px 14px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums;">${rEff}</td>
      `
      tr.innerHTML = html
      tbody.appendChild(tr)
    }
  }

  return { el: container, update }
}
