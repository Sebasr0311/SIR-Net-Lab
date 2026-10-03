/**
 * @fileoverview Gráfica comparativa EDO (campo medio) vs. promedio de M corridas
 * estocásticas en red con banda percentil 5% – 95% (Chart.js).
 * (SIR-Net Lab — docs/02 §2.3, RF-09 & T4.5)
 */

import Chart from 'chart.js/auto'
import type { BatchComparisonResult } from '../../workers/networkClient.ts'

export interface NetworkComparisonHandle {
  el: HTMLElement
  update: (data: BatchComparisonResult, mRuns: number) => void
  setProgress: (completed: number, total: number) => void
  destroy: () => void
}

export function createNetworkComparisonChart(): NetworkComparisonHandle {
  const container = document.createElement('div')
  container.className = 'card network-comparison-card'
  container.setAttribute('data-component', 'network-comparison-chart')

  const header = document.createElement('div')
  header.className = 'comparison-header'
  header.innerHTML = `
    <div>
      <h2>Comparador: EDO vs. Red estocástica</h2>
      <p class="text-muted">Contraste entre aproximación de campo medio homogéneo y dinámica sobre el grafo</p>
    </div>
    <div class="comparison-kpi" style="font-family: var(--font-mono); font-size: var(--step--1); background: var(--bg); padding: var(--space-2) var(--space-3); border-radius: 6px; border: 1px solid var(--line);">
      <span>Discrepancia (RMSE): <strong id="rmse-val">—</strong></span>
    </div>
  `

  const progressWrap = document.createElement('div')
  progressWrap.className = 'comparison-progress'
  progressWrap.style.cssText = 'display: none; margin-bottom: var(--space-3);'
  progressWrap.innerHTML = `
    <div style="display: flex; justify-content: space-between; font-size: var(--step--1); margin-bottom: 4px;">
      <span>Calculando réplicas Monte Carlo en segundo plano...</span>
      <span id="progress-text">0 / 0</span>
    </div>
    <div style="width: 100%; height: 6px; background: var(--line); border-radius: 3px; overflow: hidden;">
      <div id="progress-bar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.15s ease;"></div>
    </div>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 360px;'

  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfico comparativo de curvas de infectados entre EDO y promedio de la red con intervalo de confianza'
  )
  canvasWrap.appendChild(canvas)

  container.appendChild(header)
  container.appendChild(progressWrap)
  container.appendChild(canvasWrap)

  // Inyectar estilos
  const style = document.createElement('style')
  style.textContent = `
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .comparison-header h2 {
      font-size: var(--step-1);
    }
  `
  container.appendChild(style)

  const rmseEl = header.querySelector<HTMLElement>('#rmse-val')
  const progressText = progressWrap.querySelector<HTMLElement>('#progress-text')
  const progressBar = progressWrap.querySelector<HTMLElement>('#progress-bar')

  // Inicializar Chart.js con áreas de relleno para el percentil
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [] as string[],
      datasets: [
        {
          label: 'EDO (Campo medio continuo)',
          data: [] as number[],
          borderColor: '#1F4E79', // Accent Blue
          borderWidth: 2.5,
          pointRadius: 0,
          borderDash: [],
          fill: false,
        },
        {
          label: 'Red — Media estocástica',
          data: [] as number[],
          borderColor: '#D55E00', // Vermillion
          borderWidth: 2,
          pointRadius: 1,
          borderDash: [4, 4],
          fill: false,
        },
        {
          label: 'Percentil 95% (Red)',
          data: [] as number[],
          borderColor: 'rgba(213, 94, 0, 0.25)',
          backgroundColor: 'rgba(213, 94, 0, 0.12)',
          borderWidth: 1,
          pointRadius: 0,
          fill: '+1', // Rellena hacia el dataset siguiente (Percentil 5%)
        },
        {
          label: 'Percentil 5% (Red)',
          data: [] as number[],
          borderColor: 'rgba(213, 94, 0, 0.25)',
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Tiempo (días)',
            font: { weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          title: {
            display: true,
            text: 'Infectados activos (I)',
            font: { weight: 'bold' },
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
          min: 0,
        },
      },
    },
  })

  function setProgress(completed: number, total: number): void {
    if (completed < total) {
      progressWrap.style.display = 'block'
      const pct = Math.round((completed / total) * 100)
      if (progressBar) progressBar.style.width = `${pct}%`
      if (progressText) progressText.textContent = `${completed} / ${total} (${pct}%)`
    } else {
      progressWrap.style.display = 'none'
    }
  }

  function update(data: BatchComparisonResult, mRuns?: number): void {
    const subtitle = header.querySelector<HTMLElement>('.text-muted')
    if (subtitle && mRuns) {
      subtitle.textContent = `Contraste entre aproximación de campo medio y promedio de ${mRuns} réplicas estocásticas`
    }

    const labels = data.t.map((t) => t.toFixed(1))
    chart.data.labels = labels

    if (chart.data.datasets[0]) chart.data.datasets[0].data = data.odeI
    if (chart.data.datasets[1]) chart.data.datasets[1].data = data.meanI
    if (chart.data.datasets[2]) chart.data.datasets[2].data = data.p95I
    if (chart.data.datasets[3]) chart.data.datasets[3].data = data.p5I

    if (rmseEl) {
      rmseEl.textContent = `${data.rmseI.toFixed(1)} nodos`
    }

    if (!canvas.isConnected || !canvas.ownerDocument?.defaultView) {
      return
    }

    try {
      chart.update('none')
    } catch {
      // Ignorar excepciones al desmontar
    }
  }

  function destroy(): void {
    chart.destroy()
  }

  return { el: container, update, setProgress, destroy }
}
