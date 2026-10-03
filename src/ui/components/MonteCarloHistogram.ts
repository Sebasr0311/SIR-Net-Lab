/**
 * @fileoverview Histograma de frecuencias para propagación de incertidumbre Monte Carlo LHS (Chart.js).
 * Visualiza la distribución empírica del pico de infectados I_max y las cotas de riesgo (p5, media, p95).
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md T7.3
 */

import Chart from 'chart.js/auto'
import type { MetricDistribution } from '../../core/sensitivity/globalSensitivity.ts'

export interface MonteCarloHistogramHandle {
  el: HTMLElement
  update: (dist: MetricDistribution) => void
  destroy: () => void
}

export function createMonteCarloHistogram(): MonteCarloHistogramHandle {
  const container = document.createElement('div')
  container.className = 'card monte-carlo-histogram-card'
  container.setAttribute('data-component', 'monte-carlo-histogram')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;" class="histogram-title">Distribución empírica de I_max (LHS)</h2>
      <p class="text-muted histogram-subtitle" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Frecuencia de réplicas en función de la severidad del brote
      </p>
    </div>
    <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar histograma Monte Carlo como imagen PNG">
      📷 Exportar PNG
    </button>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 320px;'
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;'
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Histograma de frecuencias mostrando la distribución de probabilidad de infectados'
  )
  canvasWrap.appendChild(canvas)

  container.appendChild(toolbar)
  container.appendChild(canvasWrap)

  const subtitle = toolbar.querySelector<HTMLParagraphElement>('.histogram-subtitle')!
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
            label: 'Frecuencia de réplicas',
            data: [],
            backgroundColor: 'rgba(31, 78, 121, 0.75)',
            borderColor: '#1f4e79',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Pico de infectados activos (I_max)',
              font: { weight: 'bold' },
            },
            grid: { display: false },
          },
          y: {
            title: {
              display: true,
              text: 'Número de réplicas',
              font: { weight: 'bold' },
            },
            min: 0,
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Réplicas en el intervalo: ${context.raw}`,
            },
          },
        },
      },
    })
  }

  function update(dist: MetricDistribution): void {
    if (!chartInstance) initChart()
    if (!chartInstance) return

    const labels = dist.histogram.map((bin) => `${Math.round(bin.x0)}–${Math.round(bin.x1)}`)
    const counts = dist.histogram.map((bin) => bin.count)

    chartInstance.data.labels = labels
    chartInstance.data.datasets[0]!.data = counts
    chartInstance.update()

    subtitle.textContent = `Media: ${dist.mean} | Mediana: ${dist.median} | Desv. Est.: ${dist.std} | IC 90% [p5: ${dist.p5}, p95: ${dist.p95}]`
  }

  btnExport?.addEventListener('click', () => {
    if (!chartInstance) return
    const url = chartInstance.toBase64Image('image/png', 1)
    const a = document.createElement('a')
    a.href = url
    a.download = `histograma-lhs-sir-net-lab-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  })

  initChart()

  const ro = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  ro.observe(canvasWrap)

  return {
    el: container,
    update,
    destroy: () => {
      ro.disconnect()
      chartInstance?.destroy()
      chartInstance = null
    },
  }
}
