/**
 * @fileoverview Página principal del Simulador EDO (SIR-Net Lab).
 * Integra ParamPanel, KpiBar, TimeChart, PhasePlot y DataTable
 * con resolución asíncrona mediante Web Worker en menos de 50 ms.
 * (docs/05, docs/06 F3)
 */

import { store } from '../../state/store.ts'
import { simulateAsync } from '../../workers/odeClient.ts'
import { createParamPanel } from '../components/ParamPanel.ts'
import { createKpiBar } from '../components/KpiBar.ts'
import { createTimeChart } from '../components/TimeChart.ts'
import { createPhasePlot } from '../components/PhasePlot.ts'
import { createDataTable } from '../components/DataTable.ts'

export function pageSimulator(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'simulator-page'

  // Contenedor principal de dos columnas
  page.innerHTML = `
    <div class="simulator-layout">
      <div class="simulator-sidebar"></div>
      <div class="simulator-main">
        <header class="simulator-page-header" style="margin-bottom: var(--space-2);">
          <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Simulador</h1>
          <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
            Propagación de malware mediante sistemas de ecuaciones diferenciales ordinarias (SIR / SEIR / SEIS)
          </p>
        </header>
        <div class="simulator-kpis"></div>
        <div class="simulator-charts-grid">
          <div class="simulator-chart-col"></div>
          <div class="simulator-phase-col"></div>
        </div>
        <div class="simulator-data"></div>
        <div class="simulator-theory-callout card">
          <p>
            💡 <strong>¿Querés profundizar en la matemática del modelo?</strong> Aprendé cómo se deducen el ritmo reproductivo ($R_0$), el momento exacto del pico de contagios y el tamaño final del brote.
            <a href="#/theory">Ver explicaciones paso a paso en Teoría &rarr;</a>
          </p>
        </div>
      </div>
    </div>
  `

  // Inyectar estilos específicos de la página
  const style = document.createElement('style')
  style.textContent = `
    .simulator-page {
      padding: var(--space-6);
      max-width: 1440px;
      margin: 0 auto;
    }
    .simulator-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: var(--space-6);
      align-items: start;
    }
    .simulator-sidebar {
      position: sticky;
      top: 72px;
      max-height: calc(100vh - 90px);
      overflow-y: auto;
      padding-right: var(--space-2);
    }
    .simulator-main {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      min-width: 0;
    }
    .simulator-charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }
    .simulator-theory-callout {
      border-left: 4px solid var(--accent);
      background: var(--surface);
    }
    @media (max-width: 960px) {
      .simulator-layout {
        grid-template-columns: 1fr;
      }
      .simulator-sidebar {
        position: static;
        max-height: none;
        padding-right: 0;
      }
    }
    @media (max-width: 640px) {
      .simulator-page {
        padding: var(--space-4) var(--space-3);
      }
      .simulator-layout {
        gap: var(--space-4);
      }
      .simulator-main {
        gap: var(--space-4);
      }
    }
  `
  page.appendChild(style)

  // Instanciar componentes
  const sidebarSlot = page.querySelector<HTMLElement>('.simulator-sidebar')
  const kpisSlot = page.querySelector<HTMLElement>('.simulator-kpis')
  const chartSlot = page.querySelector<HTMLElement>('.simulator-chart-col')
  const phaseSlot = page.querySelector<HTMLElement>('.simulator-phase-col')
  const dataSlot = page.querySelector<HTMLElement>('.simulator-data')

  const paramPanel = createParamPanel()
  const kpiBar = createKpiBar()
  const timeChart = createTimeChart()
  const phasePlot = createPhasePlot()
  const dataTable = createDataTable()

  if (sidebarSlot) sidebarSlot.appendChild(paramPanel.el)
  if (kpisSlot) kpisSlot.appendChild(kpiBar.el)
  if (chartSlot) chartSlot.appendChild(timeChart.el)
  if (phaseSlot) phaseSlot.appendChild(phasePlot.el)
  if (dataSlot) dataSlot.appendChild(dataTable.el)

  // Ejecución y actualización del simulador
  let isSimulating = false
  let pendingUpdate = false

  async function runSimulation(): Promise<void> {
    if (isSimulating) {
      pendingUpdate = true
      return
    }

    isSimulating = true
    const state = store.getState()

    try {
      const res = await simulateAsync(state)
      if (res.ok && res.series && res.analysis) {
        const { series, events, analysis } = res

        // 1. Gráfica temporal
        timeChart.update(series, events?.peakTime, events?.peakI)

        // 2. Retrato de fase
        phasePlot.update(
          state.params,
          { S: series.S, I: series.I },
          analysis.r0,
          analysis.analyticalPeak.sAtPeak,
          analysis.analyticalPeak.iMax
        )

        // 3. Barra de KPIs
        kpiBar.update({
          r0: analysis.r0,
          criticalCoverage: analysis.criticalCoverage,
          peakI: events?.peakI ?? analysis.analyticalPeak.iMax,
          peakTime: events?.peakTime ?? -1,
          finalAttackRate: analysis.finalSize.attackRate,
        })

        // 4. Tabla accesible de datos y exportación a Excel/CSV
        dataTable.update(series, analysis.r0, state.params.N, {
          model: state.model.toUpperCase(),
          solver: state.solver.toUpperCase(),
          beta: state.params.beta,
          gamma: state.params.gamma,
          sigma: state.params.sigma,
          nu: state.params.nu,
          i0: state.params.i0,
          dt: state.dt,
          tMax: state.tMax,
          r0: analysis.r0,
          peakI: events?.peakI ?? analysis.analyticalPeak.iMax,
          peakTime: events?.peakTime ?? -1,
          criticalCoverage: analysis.criticalCoverage,
          sInfinity: analysis.finalSize.sInfinity,
          finalAttackRate: analysis.finalSize.attackRate,
        })
      }
    } finally {
      isSimulating = false
      if (pendingUpdate) {
        pendingUpdate = false
        void runSimulation()
      }
    }
  }

  // Suscribirse a cambios del store reactivo
  const unsubscribe = store.subscribe(() => {
    void runSimulation()
  })

  // Ejecutar primera simulación inicial
  void runSimulation()

  // Manejo de limpieza al salir
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === page || node.contains(page)) {
          unsubscribe()
          paramPanel.destroy()
          timeChart.destroy()
          phasePlot.destroy()
          observer.disconnect()
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return page
}
