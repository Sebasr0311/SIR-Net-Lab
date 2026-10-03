/**
 * @fileoverview Gráfica interactiva de calibración de modelos epidémicos (Chart.js).
 * Visualiza puntos dispersos de datos observados (t_i, I_i), curva de ajuste del modelo
 * SIR/SEIR y bandas de confianza al 95% calculadas por remuestreo bootstrap.
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.3
 */

import Chart from 'chart.js/auto'
import type { Series } from '../../core/models/types.ts'
import type { Observation } from '../../core/calibration/syntheticData.ts'

export interface BootstrapConfidenceBand {
  t: number[]
  lowerI: number[]
  upperI: number[]
}

export interface CalibrationChartHandle {
  el: HTMLElement
  update: (
    data: Observation[],
    fittedSeries?: Series | null,
    confidenceBand?: BootstrapConfidenceBand | null
  ) => void
  destroy: () => void
}

export function createCalibrationChart(): CalibrationChartHandle {
  const container = document.createElement('div')
  container.className = 'card calibration-chart-card'
  container.setAttribute('data-component', 'calibration-chart')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;">Ajuste del modelo frente a observaciones</h2>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Puntos observados (I_obs), curva simulada por EDO y banda de confianza 95% (Bootstrap)
      </p>
    </div>
    <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar gráfico de ajuste como imagen PNG">
      📷 Exportar PNG
    </button>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 350px;'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfico de dispersión de observaciones y curva de ajuste con intervalo de confianza'
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
      type: 'scatter',
      data: {
        datasets: [
          {
            type: 'scatter',
            label: 'Datos observados (I_obs)',
            data: [],
            backgroundColor: '#d55e00',
            borderColor: '#b3261e',
            borderWidth: 1.5,
            pointRadius: 5,
            pointHoverRadius: 7,
            order: 1,
          },
          {
            type: 'line',
            label: 'Curva ajustada Î(t)',
            data: [],
            borderColor: '#1f4e79',
            backgroundColor: 'transparent',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.1,
            order: 2,
          },
          {
            type: 'line',
            label: 'IC 95% Superior',
            data: [],
            borderColor: 'rgba(31, 78, 121, 0.3)',
            backgroundColor: 'rgba(31, 78, 121, 0.12)',
            fill: '+1',
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [4, 4],
            order: 3,
          },
          {
            type: 'line',
            label: 'IC 95% Inferior',
            data: [],
            borderColor: 'rgba(31, 78, 121, 0.3)',
            backgroundColor: 'transparent',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [4, 4],
            order: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Tiempo t (días)',
              font: { weight: 'bold' },
            },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
          y: {
            title: {
              display: true,
              text: 'Infectados activos I(t)',
              font: { weight: 'bold' },
            },
            min: 0,
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { size: 12 },
              filter: (item) => !item.text.includes('Inferior'), // Unificar IC en una sola leyenda
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const parsed = context.raw as { x: number; y: number }
                return `${context.dataset.label}: t = ${parsed.x.toFixed(1)} d, I = ${Math.round(parsed.y)}`
              },
            },
          },
        },
      },
    })
  }

  function update(
    data: Observation[],
    fittedSeries?: Series | null,
    confidenceBand?: BootstrapConfidenceBand | null
  ): void {
    if (!chartInstance) initChart()
    if (!chartInstance) return

    // 1. Datos observados
    const obsPoints = data.map((d) => ({ x: d.t, y: d.I }))
    chartInstance.data.datasets[0]!.data = obsPoints

    // 2. Curva ajustada
    if (fittedSeries) {
      const step = Math.max(1, Math.floor(fittedSeries.t.length / 200))
      const fittedPoints: Array<{ x: number; y: number }> = []
      for (let i = 0; i < fittedSeries.t.length; i += step) {
        fittedPoints.push({
          x: fittedSeries.t[i] ?? 0,
          y: fittedSeries.I[i] ?? 0,
        })
      }
      chartInstance.data.datasets[1]!.data = fittedPoints
    } else {
      chartInstance.data.datasets[1]!.data = []
    }

    // 3. Bandas de confianza
    if (confidenceBand && confidenceBand.t.length > 0) {
      const upperPoints = confidenceBand.t.map((t, idx) => ({
        x: t,
        y: confidenceBand.upperI[idx] ?? 0,
      }))
      const lowerPoints = confidenceBand.t.map((t, idx) => ({
        x: t,
        y: confidenceBand.lowerI[idx] ?? 0,
      }))
      chartInstance.data.datasets[2]!.data = upperPoints
      chartInstance.data.datasets[3]!.data = lowerPoints
    } else {
      chartInstance.data.datasets[2]!.data = []
      chartInstance.data.datasets[3]!.data = []
    }

    if (!canvas.isConnected || !canvas.ownerDocument?.defaultView) {
      return
    }

    try {
      chartInstance.update('none')
    } catch {
      // Ignorar excepciones transitorias al desmontar
    }
  }

  btnExport?.addEventListener('click', () => {
    if (!chartInstance) return
    const url = chartInstance.toBase64Image('image/png', 1)
    const a = document.createElement('a')
    a.href = url
    a.download = `calibracion-sir-net-lab-${new Date().toISOString().slice(0, 10)}.png`
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
