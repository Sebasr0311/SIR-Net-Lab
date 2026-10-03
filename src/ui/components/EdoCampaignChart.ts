/**
 * @fileoverview Gráfico comparativo de campañas de control por impulsos en EDO (Chart.js).
 * Visualiza el impacto de los impulsos de vacunación/parcheo sobre las trayectorias S, I y R,
 * evidenciando la discontinuidad en S y R y la amortiguación del pico de I.
 * (SIR-Net Lab — docs/02 §2.2, T5.1)
 */

import Chart from 'chart.js/auto'
import type { CampaignComparison } from '../../core/control/campaigns.ts'

export interface EdoCampaignChartHandle {
  el: HTMLElement
  update: (data: CampaignComparison) => void
  destroy: () => void
}

export function createEdoCampaignChart(): EdoCampaignChartHandle {
  const container = document.createElement('div')
  container.className = 'card edo-campaign-chart-card'
  container.setAttribute('data-component', 'edo-campaign-chart')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;">Evolución con campañas de control (EDO)</h2>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Salto instantáneo en S y R en instantes de parcheo t_k y amortiguación del pico
      </p>
    </div>
    <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar gráfico de campaña EDO como imagen PNG">
      📷 Exportar PNG
    </button>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 350px;'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfico de líneas comparando la epidemia sin intervención vs con campañas de parcheo'
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
            label: 'I (Sin intervención)',
            data: [],
            borderColor: '#b3261e',
            backgroundColor: 'rgba(179, 38, 30, 0.08)',
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'I (Con campaña)',
            data: [],
            borderColor: '#d55e00',
            backgroundColor: 'rgba(213, 94, 0, 0.15)',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: 'S (Susceptibles)',
            data: [],
            borderColor: '#0072b2',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
          },
          {
            label: 'R (Inmunizados/Removidos)',
            data: [],
            borderColor: '#009e73',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
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
            title: { display: true, text: 'Número de equipos / usuarios', color: '#4A5560' },
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
              usePointStyle: false,
              color: '#1B1F24',
            },
          },
          tooltip: {
            callbacks: {
              label: (context): string =>
                ` ${context.dataset.label}: ${Math.round(context.parsed.y ?? 0)}`,
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
    link.download = 'campana-control-edo.png'
    link.href = url
    link.click()
  })

  function update(data: CampaignComparison): void {
    if (!chartInstance) return

    const { baseline, controlled } = data
    // Submuestrear si hay demasiados puntos para mantener fluidez
    const step = Math.max(1, Math.floor(controlled.t.length / 300))
    const labels: string[] = []
    const baseI: number[] = []
    const ctrlI: number[] = []
    const ctrlS: number[] = []
    const ctrlR: number[] = []

    for (let i = 0; i < controlled.t.length; i += step) {
      const timeVal = controlled.t[i] ?? 0
      labels.push(timeVal.toFixed(1))
      ctrlI.push(controlled.I[i] ?? 0)
      ctrlS.push(controlled.S[i] ?? 0)
      ctrlR.push(controlled.R[i] ?? 0)

      // Buscar punto más cercano en baseline
      const baseIdx = Math.min(i, baseline.I.length - 1)
      baseI.push(baseline.I[baseIdx] ?? 0)
    }

    chartInstance.data.labels = labels
    if (chartInstance.data.datasets[0]) chartInstance.data.datasets[0].data = baseI
    if (chartInstance.data.datasets[1]) chartInstance.data.datasets[1].data = ctrlI
    if (chartInstance.data.datasets[2]) chartInstance.data.datasets[2].data = ctrlS
    if (chartInstance.data.datasets[3]) chartInstance.data.datasets[3].data = ctrlR

    if (!canvas.isConnected || !canvas.ownerDocument?.defaultView) {
      return
    }

    try {
      chartInstance.update('none')
    } catch {
      // Ignorar excepciones al desmontar
    }
  }

  function destroy(): void {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  }

  return { el: container, update, destroy }
}
