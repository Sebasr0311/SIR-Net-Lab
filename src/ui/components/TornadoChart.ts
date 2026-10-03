/**
 * @fileoverview Gráfico Tornado de Sensibilidad Local (Chart.js horizontal bar chart).
 * Muestra el ranking de impacto paramétrico ordenado por magnitud absoluta de elasticidad,
 * con barras divergentes respecto al cero (impactos positivos vs negativos).
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.1
 */

import Chart from 'chart.js/auto'
import type { LocalSensitivityReport } from '../../core/sensitivity/localSensitivity.ts'

export interface TornadoChartHandle {
  el: HTMLElement
  update: (report: LocalSensitivityReport) => void
  destroy: () => void
}

const PARAM_LABELS: Record<string, string> = {
  beta: 'Tasa de contacto (β)',
  gamma: 'Tasa de recuperación (γ)',
  i0: 'Infección inicial (I₀)',
  N: 'Población total (N)',
  sigma: 'Tasa de latencia (σ)',
}

export function createTornadoChart(): TornadoChartHandle {
  const container = document.createElement('div')
  container.className = 'card tornado-chart-card'
  container.setAttribute('data-component', 'tornado-chart')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;">Gráfico Tornado — Sensibilidad Normalizada</h2>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Elasticidad S = (∂Y/∂p)·(p/Y) — % de cambio en la salida ante un 1% de cambio en el parámetro
      </p>
    </div>
    <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar gráfico tornado como imagen PNG">
      📷 Exportar PNG
    </button>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 320px;'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfico tornado mostrando la sensibilidad e impacto relativo de cada parámetro epidemiológico'
  )
  canvasWrap.appendChild(canvas)

  container.appendChild(toolbar)
  container.appendChild(canvasWrap)

  const btnExport = toolbar.querySelector<HTMLButtonElement>('.btn-export-png')

  let chartInstance: Chart | null = null

  function initChart(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Índice de elasticidad normalizada',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Elasticidad normalizada S',
              font: { weight: 'bold' },
            },
            grid: {
              color: (context) => (context.tick.value === 0 ? '#1b1f24' : 'rgba(0,0,0,0.06)'),
              lineWidth: (context) => (context.tick.value === 0 ? 2 : 1),
            },
          },
          y: {
            grid: { display: false },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = Number(context.raw)
                const sign = val > 0 ? '+' : ''
                return `Elasticidad: ${sign}${val.toFixed(3)} (un +1% altera la métrica en ${sign}${val.toFixed(3)}%)`
              },
            },
          },
        },
      },
    })
  }

  function update(report: LocalSensitivityReport): void {
    if (!chartInstance) initChart()
    if (!chartInstance) return

    const labels = report.parameters.map((p) => PARAM_LABELS[p.param] || p.param)
    const data = report.parameters.map((p) => p.index)

    // Colores: Azul marino si es positivo, Rojo si es negativo
    const backgroundColors = data.map((v) =>
      v >= 0 ? 'rgba(31, 78, 121, 0.85)' : 'rgba(179, 38, 30, 0.85)'
    )
    const borderColors = data.map((v) => (v >= 0 ? '#1f4e79' : '#b3261e'))

    chartInstance.data.labels = labels
    chartInstance.data.datasets[0]!.data = data
    chartInstance.data.datasets[0]!.backgroundColor = backgroundColors
    chartInstance.data.datasets[0]!.borderColor = borderColors

    if (!canvas.isConnected || !canvas.ownerDocument?.defaultView) {
      return
    }

    try {
      chartInstance.update('none')
    } catch {
      // Ignorar excepciones al desmontar
    }
  }

  btnExport?.addEventListener('click', () => {
    if (!chartInstance) return
    const url = chartInstance.toBase64Image('image/png', 1)
    const a = document.createElement('a')
    a.href = url
    a.download = `tornado-sensibilidad-sir-net-lab-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  })

  initChart()

  return {
    el: container,
    update,
    destroy: () => {
      chartInstance?.destroy()
      chartInstance = null
    },
  }
}
