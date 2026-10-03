/**
 * @fileoverview Gráfica multilínea interactiva comparando estrategias de inmunización en red (Chart.js).
 * Representa la evolución temporal de infectados I(t) para cada estrategia
 * (Sin intervención, Aleatoria, Hubs, Vecinos) bajo el mismo presupuesto y semilla.
 * (SIR-Net Lab — docs/02 §2.3, T5.3)
 */

import Chart from 'chart.js/auto'
import type { StrategyEvaluationReport } from '../../sim/strategies.ts'

export interface StrategyComparisonChartHandle {
  el: HTMLElement
  update: (report: StrategyEvaluationReport) => void
  destroy: () => void
}

export function createStrategyComparisonChart(): StrategyComparisonChartHandle {
  const container = document.createElement('div')
  container.className = 'card strategy-comparison-chart-card'
  container.setAttribute('data-component', 'strategy-comparison-chart')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;">Comparación de curvas epidémicas por estrategia</h2>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Infectados activos I(t) en red bajo presupuesto fijo y semillas pareadas
      </p>
    </div>
    <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar comparación de estrategias como imagen PNG">
      📷 Exportar PNG
    </button>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 350px;'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfico comparando curvas de infección entre estrategias de control en red'
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
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Sin intervención',
            data: [],
            borderColor: '#b3261e', // Rojo
            backgroundColor: 'rgba(179, 38, 30, 0.08)',
            borderDash: [5, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Aleatoria',
            data: [],
            borderColor: '#e69f00', // Ámbar Okabe-Ito
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Muestreo de vecinos',
            data: [],
            borderColor: '#cc79a7', // Rosa/Púrpura Okabe-Ito
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'Dirigida a hubs',
            data: [],
            borderColor: '#009e73', // Verde Okabe-Ito
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 150 },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: { display: true, text: 'Tiempo (días)', color: '#4A5560' },
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { color: '#4A5560', maxTicksLimit: 12 },
          },
          y: {
            title: { display: true, text: 'Infectados activos (I)', color: '#4A5560' },
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: { color: '#4A5560' },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              color: '#1B1F24',
            },
          },
          tooltip: {
            callbacks: {
              label: (context): string =>
                ` ${context.dataset.label}: ${Math.round(context.parsed.y ?? 0)} nodos`,
            },
          },
        },
      },
    })
  }

  initChart()

  btnExport?.addEventListener('click', () => {
    if (!chartInstance) return
    const url = chartInstance.toBase64Image('image/png', 1)
    const link = document.createElement('a')
    link.download = 'comparacion-estrategias-red.png'
    link.href = url
    link.click()
  })

  function update(report: StrategyEvaluationReport): void {
    if (!chartInstance) return

    const { results } = report
    const ref = results.none || results.random || results.hubs
    if (!ref) return

    const step = Math.max(1, Math.floor(ref.t.length / 300))
    const labels: string[] = []
    const noneData: number[] = []
    const randData: number[] = []
    const acqData: number[] = []
    const hubsData: number[] = []

    for (let i = 0; i < ref.t.length; i += step) {
      labels.push((ref.t[i] ?? 0).toFixed(1))
      noneData.push(results.none?.I[i] ?? 0)
      randData.push(results.random?.I[i] ?? 0)
      acqData.push(results.acquaintance?.I[i] ?? 0)
      hubsData.push(results.hubs?.I[i] ?? 0)
    }

    chartInstance.data.labels = labels
    if (chartInstance.data.datasets[0]) chartInstance.data.datasets[0].data = noneData
    if (chartInstance.data.datasets[1]) chartInstance.data.datasets[1].data = randData
    if (chartInstance.data.datasets[2]) chartInstance.data.datasets[2].data = acqData
    if (chartInstance.data.datasets[3]) chartInstance.data.datasets[3].data = hubsData

    chartInstance.update('none')
  }

  function destroy(): void {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  }

  return { el: container, update, destroy }
}
