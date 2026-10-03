/**
 * @fileoverview Gráfica de series temporales de la epidemia (S, E, I, R) usando Chart.js.
 * Cumple con accesibilidad: paleta Okabe-Ito, líneas con patrones diferenciados,
 * tooltips detallados y exportación a PNG de alta resolución. (SIR-Net Lab)
 */

import Chart from 'chart.js/auto'

export interface TimeChartSeries {
  t: number[]
  S: number[]
  E?: number[]
  I: number[]
  R: number[]
}

export interface TimeChartHandle {
  el: HTMLElement
  update: (series: TimeChartSeries, peakTime?: number, peakI?: number) => void
  destroy: () => void
}

/**
 * Crea el componente de gráfica temporal con Chart.js.
 */
export function createTimeChart(): TimeChartHandle {
  const container = document.createElement('div')
  container.className = 'card time-chart-card'
  container.setAttribute('data-component', 'time-chart')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.innerHTML = `
    <div class="time-chart-title">
      <h2>Evolución temporal del brote</h2>
      <p class="text-muted">Población por estado vs. tiempo (días)</p>
    </div>
    <div class="time-chart-actions">
      <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar gráfico como imagen PNG">
        📷 Exportar PNG
      </button>
    </div>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'time-chart-canvas-wrap'
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 380px;'

  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Gráfica de líneas que muestra la evolución de Susceptibles, Expuestos, Infectados y Recuperados a lo largo del tiempo'
  )
  canvasWrap.appendChild(canvas)

  container.appendChild(toolbar)
  container.appendChild(canvasWrap)

  // Inyectar estilos específicos de la gráfica
  const style = document.createElement('style')
  style.textContent = `
    .time-chart-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .time-chart-title h2 {
      font-size: var(--step-1);
    }
    .text-muted {
      font-size: var(--step--1);
      color: var(--ink-2);
    }
  `
  container.appendChild(style)

  // Inicializar Chart.js
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [] as string[],
      datasets: [
        {
          label: 'S — Susceptibles',
          data: [] as number[],
          borderColor: '#0072B2', // Okabe-Ito Blue
          backgroundColor: '#0072B2',
          borderWidth: 2,
          pointRadius: 0,
          borderDash: [],
        },
        {
          label: 'E — Expuestos',
          data: [] as number[],
          borderColor: '#E69F00', // Okabe-Ito Amber
          backgroundColor: '#E69F00',
          borderWidth: 2,
          pointRadius: 0,
          borderDash: [6, 6], // Distinción visual para daltonismo
          hidden: true,
        },
        {
          label: 'I — Infectados',
          data: [] as number[],
          borderColor: '#D55E00', // Okabe-Ito Vermillion
          backgroundColor: '#D55E00',
          borderWidth: 3,
          pointRadius: 0,
          borderDash: [],
        },
        {
          label: 'R — Recuperados',
          data: [] as number[],
          borderColor: '#009E73', // Okabe-Ito Green
          backgroundColor: '#009E73',
          borderWidth: 2,
          pointRadius: 0,
          borderDash: [2, 2],
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
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 13,
            },
          },
        },
        tooltip: {
          callbacks: {
            title(tooltipItems): string {
              return `Día ${tooltipItems[0]?.label ?? ''}`
            },
            label(tooltipItem): string {
              const val = Number(tooltipItem.raw).toFixed(1)
              return ` ${tooltipItem.dataset.label ?? ''}: ${val}`
            },
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
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Población (individuos / nodos)',
            font: { weight: 'bold' },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          min: 0,
        },
      },
    },
  })

  // Exportar PNG
  const btnExport = toolbar.querySelector<HTMLButtonElement>('.btn-export-png')
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const url = chart.toBase64Image('image/png', 1)
      const link = document.createElement('a')
      link.download = 'sir-net-lab-evolucion-temporal.png'
      link.href = url
      link.click()
    })
  }

  function update(series: TimeChartSeries, peakTime?: number, peakI?: number): void {
    const subtitleEl = toolbar.querySelector<HTMLParagraphElement>('.text-muted')
    if (subtitleEl) {
      if (peakTime !== undefined && peakI !== undefined && peakI > 0 && peakTime >= 0) {
        subtitleEl.textContent = `Pico estimado: ${Math.round(peakI)} infectados (día ${peakTime.toFixed(1)})`
      } else {
        subtitleEl.textContent = 'Población por estado vs. tiempo (días)'
      }
    }

    const labels = series.t.map((ti) => ti.toFixed(1))
    chart.data.labels = labels

    // Dataset S
    if (chart.data.datasets[0]) {
      chart.data.datasets[0].data = series.S
    }

    // Dataset E
    if (chart.data.datasets[1]) {
      if (series.E && series.E.length > 0) {
        chart.data.datasets[1].data = series.E
        chart.data.datasets[1].hidden = false
      } else {
        chart.data.datasets[1].data = []
        chart.data.datasets[1].hidden = true
      }
    }

    // Dataset I
    if (chart.data.datasets[2]) {
      chart.data.datasets[2].data = series.I
    }

    // Dataset R
    if (chart.data.datasets[3]) {
      chart.data.datasets[3].data = series.R
    }

    if (!canvas.isConnected || !canvas.ownerDocument?.defaultView) {
      return
    }

    try {
      chart.update('none') // Actualización inmediata sin animaciones lentas
    } catch {
      // Ignorar excepciones transitorias si el canvas se desmontó durante la transición de ruta
    }
  }

  function destroy(): void {
    chart.destroy()
  }

  return { el: container, update, destroy }
}
