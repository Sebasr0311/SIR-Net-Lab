/**
 * @fileoverview Página principal de Control y Estrategias (SIR-Net Lab).
 * Integra campañas de parcheo programables por impulsos en EDO y
 * comparación de estrategias de inmunización en redes complejas.
 * (docs/02 §2.2 & §2.3, docs/06 F5, RF-10 & RF-11)
 */

import { store } from '../../state/store.ts'
import { simulateEdoCampaign, type PatchImpulse } from '../../core/control/campaigns.ts'
import { criticalCoverage } from '../../core/analysis/r0.ts'
import { generateBarabasiAlbert } from '../../sim/graphs/ba.ts'
import { generateWattsStrogatz } from '../../sim/graphs/ws.ts'
import { generateErdosRenyi } from '../../sim/graphs/er.ts'
import { evaluateStrategies } from '../../sim/strategies.ts'
import { createEdoCampaignChart } from '../components/EdoCampaignChart.ts'
import { createStrategyComparisonChart } from '../components/StrategyComparisonChart.ts'
import { createStrategyTable } from '../components/StrategyTable.ts'

export function pageControl(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'control-page'

  page.innerHTML = `
    <div class="control-layout" style="max-width: 1200px; margin: 0 auto; padding: var(--space-4);">
      <header class="control-header" style="margin-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Control</h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
          Estrategias de defensa: aplicá parches de seguridad y evaluá cómo contener el malware en la red
        </p>
      </header>

      <!-- Pestañas de navegación de modo de control -->
      <div class="control-tabs" role="tablist" aria-label="Modo de control" style="display: flex; gap: var(--space-2); margin-bottom: var(--space-4); border-bottom: 1px solid var(--line); padding-bottom: var(--space-2); flex-wrap: wrap;">
        <button class="btn btn-tab btn-tab-edo" role="tab" aria-selected="true" aria-controls="panel-edo" id="tab-edo" type="button" style="font-weight: 600;">
          📈 Campañas de actualización (Parches)
        </button>
        <button class="btn btn-tab btn-tab-network btn--ghost" role="tab" aria-selected="false" aria-controls="panel-network" id="tab-network" type="button">
          🕸️ Inmunización en Redes
        </button>
      </div>

      <!-- Panel 1: EDO por Impulsos -->
      <section id="panel-edo" role="tabpanel" aria-labelledby="tab-edo" style="display: block;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          <!-- Panel de control de campañas EDO -->
          <div class="card" style="padding: var(--space-4);">
            <h3 style="font-size: var(--step-0); margin-bottom: var(--space-3);">Programación de campañas de parcheo</h3>
            
            <div style="margin-bottom: var(--space-3);">
              <label for="slider-beta" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Velocidad de contagio (β): <span id="val-beta">0.60</span>
              </label>
              <input type="range" id="slider-beta" aria-label="Tasa de contacto beta" min="0.1" max="1.5" step="0.05" value="0.6" style="width: 100%;" />
            </div>

            <div style="margin-bottom: var(--space-3);">
              <label for="slider-gamma" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Velocidad de recuperación / desinfección (γ): <span id="val-gamma">0.20</span>
              </label>
              <input type="range" id="slider-gamma" aria-label="Tasa de recuperación gamma" min="0.05" max="0.5" step="0.01" value="0.2" style="width: 100%;" />
            </div>

            <hr style="border: 0; border-top: 1px solid var(--line); margin: var(--space-3) 0;" />

            <h4 style="font-size: var(--step--1); margin-bottom: var(--space-2); text-transform: uppercase; letter-spacing: 0.5px; color: var(--ink-2);">
              Actualizaciones programadas (Día y % de equipos)
            </h4>

            <div id="impulses-list" style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3);"></div>

            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <button class="btn btn--secondary btn-add-impulse" type="button" style="font-size: var(--step--1);">
                ➕ Agregar impulso
              </button>
              <button class="btn btn--ghost btn-preset-critical" type="button" style="font-size: var(--step--1);">
                🛡️ Cobertura mínima de seguridad
              </button>
            </div>
          </div>

          <!-- KPIs de impacto EDO -->
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4);">
              <div>
                <span class="text-muted" style="font-size: var(--step--1); color: var(--ink-2);">Infecciones evitadas</span>
                <div id="kpi-prevented" style="font-size: var(--step-2); font-weight: bold; font-family: var(--font-mono); color: var(--ok);">0</div>
              </div>
              <div style="font-size: 2rem;" aria-hidden="true">🛡️</div>
            </div>

            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4);">
              <div>
                <span class="text-muted" style="font-size: var(--step--1); color: var(--ink-2);">Reducción del pico de contagios</span>
                <div id="kpi-peak-red" style="font-size: var(--step-2); font-weight: bold; font-family: var(--font-mono); color: var(--accent);">0</div>
              </div>
              <div style="font-size: 2rem;" aria-hidden="true">📉</div>
            </div>

            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4);">
              <div>
                <span class="text-muted" style="font-size: var(--step--1); color: var(--ink-2);">Cobertura crítica teórica (p_c)</span>
                <div id="kpi-pc" style="font-size: var(--step-2); font-weight: bold; font-family: var(--font-mono); color: var(--ink);">0.0%</div>
              </div>
              <div style="font-size: 2rem;" aria-hidden="true">🎯</div>
            </div>
          </div>
        </div>

        <!-- Gráfico EDO -->
        <div class="slot-edo-chart"></div>

        <div class="card" style="margin-top: var(--space-4); border-left: 4px solid var(--accent);">
          <h4 style="font-size: var(--step-0); margin-bottom: var(--space-1);">Fundamento analítico de impulsos</h4>
          <p style="font-size: var(--step--1); line-height: 1.6; color: var(--ink-2); margin: 0;">
            Una campaña de parcheo masivo en el instante $t_k$ transfiere instantáneamente una proporción $p_k$ de la población susceptible $S$ a removida $R$:
            <strong>S(t_k⁺) = S(t_k⁻)(1 - p_k)</strong> y <strong>R(t_k⁺) = R(t_k⁻) + p_k S(t_k⁻)</strong>.
            Si el salto reduce $S$ por debajo del umbral $N / R_0$, el número reproductivo efectivo $R_{ef} = R_0 S/N$ cae por debajo de 1,
            forzando a $dI/dt &lt; 0$ y deteniendo de inmediato el crecimiento exponencial del malware.
          </p>
        </div>
      </section>

      <!-- Panel 2: Inmunización en Redes -->
      <section id="panel-network" role="tabpanel" aria-labelledby="tab-network" style="display: none;">
        <div class="card" style="padding: var(--space-4); margin-bottom: var(--space-4);">
          <h3 style="font-size: var(--step-0); margin-bottom: var(--space-3);">Configuración de experimento en red</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: var(--space-3); align-items: end;">
            <div>
              <label for="select-topology" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Topología:
              </label>
              <select id="select-topology" aria-label="Topología de red" style="width: 100%; padding: 6px 10px; border-radius: 4px; border: 1px solid var(--line); background: var(--surface); color: var(--ink);">
                <option value="ba" selected>Barabási–Albert (Libre de escala / Hubs)</option>
                <option value="ws">Watts–Strogatz (Small-World / Clusters)</option>
                <option value="er">Erdős–Rényi (Aleatoria homogénea)</option>
              </select>
            </div>

            <div>
              <label for="slider-budget" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Presupuesto de nodos: <span id="val-budget-pct">15%</span>
              </label>
              <input type="range" id="slider-budget" aria-label="Presupuesto de nodos para inmunización" min="5" max="40" step="5" value="15" style="width: 100%;" />
            </div>

            <div>
              <label for="input-net-seed" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Semilla pareada:
              </label>
              <input type="number" id="input-net-seed" aria-label="Semilla pareada para simulación en red" value="42" style="width: 100%; padding: 6px 10px; font-family: var(--font-mono); border-radius: 4px; border: 1px solid var(--line); background: var(--surface); color: var(--ink);" />
            </div>

            <div>
              <button class="btn btn--primary btn-run-strategies" type="button" style="width: 100%;">
                ⚡ Evaluar estrategias
              </button>
            </div>
          </div>
        </div>

        <div id="strategy-summary-banner" class="card" style="padding: var(--space-3); margin-bottom: var(--space-4); background: rgba(0, 158, 115, 0.08); border: 1px solid var(--ok); color: var(--ink); display: none;">
          <p id="strategy-summary-text" style="font-size: var(--step--1); margin: 0; font-weight: 500;"></p>
        </div>

        <div class="slot-strategy-chart" style="margin-bottom: var(--space-4);"></div>
        <div class="slot-strategy-table" style="margin-bottom: var(--space-4);"></div>

        <div class="card" style="border-left: 4px solid var(--ok);">
          <h4 style="font-size: var(--step-0); margin-bottom: var(--space-1);">¿Por qué la estrategia de vecinos (Acquaintance) es tan potente?</h4>
          <p style="font-size: var(--step--1); line-height: 1.6; color: var(--ink-2); margin: 0;">
            En redes descentralizadas (como Internet o redes Zero-Trust), un administrador rara vez conoce la topología completa para identificar los hubs globales.
            La <strong>inmunización por conocidos</strong> selecciona nodos al azar e inmuniza a uno de sus vecinos.
            Debido a la <em>Paradoja de la Amistad</em>, la probabilidad de que un nodo sea vecino de otro es proporcional a su grado $k$.
            Así, el grado promedio de un vecino muestreado es $\\langle k^2 \\rangle / \\langle k \\rangle \\gg \\langle k \\rangle$, localizando a los nodos más conectados
            de manera puramente local y sin telemetría centralizada.
          </p>
        </div>
      </section>
    </div>
  `

  // Pestañas
  const tabEdo = page.querySelector<HTMLButtonElement>('.btn-tab-edo')
  const tabNetwork = page.querySelector<HTMLButtonElement>('.btn-tab-network')
  const panelEdo = page.querySelector<HTMLElement>('#panel-edo')
  const panelNetwork = page.querySelector<HTMLElement>('#panel-network')

  tabEdo?.addEventListener('click', () => {
    tabEdo.classList.remove('btn--ghost')
    tabEdo.setAttribute('aria-selected', 'true')
    tabNetwork?.classList.add('btn--ghost')
    tabNetwork?.setAttribute('aria-selected', 'false')
    if (panelEdo) panelEdo.style.display = 'block'
    if (panelNetwork) panelNetwork.style.display = 'none'
  })

  tabNetwork?.addEventListener('click', () => {
    tabNetwork.classList.remove('btn--ghost')
    tabNetwork.setAttribute('aria-selected', 'true')
    tabEdo?.classList.add('btn--ghost')
    tabEdo?.setAttribute('aria-selected', 'false')
    if (panelEdo) panelEdo.style.display = 'none'
    if (panelNetwork) panelNetwork.style.display = 'block'
    // Ejecutar evaluación automática la primera vez
    runNetworkEvaluation()
  })

  // Componentes EDO
  const edoChart = createEdoCampaignChart()
  page.querySelector('.slot-edo-chart')?.appendChild(edoChart.el)

  const valBeta = page.querySelector<HTMLElement>('#val-beta')
  const valGamma = page.querySelector<HTMLElement>('#val-gamma')
  const sliderBeta = page.querySelector<HTMLInputElement>('#slider-beta')
  const sliderGamma = page.querySelector<HTMLInputElement>('#slider-gamma')
  const kpiPrevented = page.querySelector<HTMLElement>('#kpi-prevented')
  const kpiPeakRed = page.querySelector<HTMLElement>('#kpi-peak-red')
  const kpiPc = page.querySelector<HTMLElement>('#kpi-pc')
  const impulsesContainer = page.querySelector<HTMLElement>('#impulses-list')
  const btnAddImpulse = page.querySelector<HTMLButtonElement>('.btn-add-impulse')
  const btnPresetCritical = page.querySelector<HTMLButtonElement>('.btn-preset-critical')

  // Lista de impulsos interactiva
  let currentImpulses: PatchImpulse[] = [{ t: 8, p: 0.35 }]

  function renderImpulses(): void {
    if (!impulsesContainer) return
    impulsesContainer.innerHTML = ''

    currentImpulses.forEach((imp, idx) => {
      const row = document.createElement('div')
      row.style.cssText =
        'display: flex; align-items: center; justify-content: space-between; background: var(--bg); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--line); font-size: var(--step--1);'
      row.innerHTML = `
        <div>
          <strong>Día ${imp.t}:</strong> ${(imp.p * 100).toFixed(0)}% susceptibles
        </div>
        <button class="btn btn--ghost btn-remove-impulse" type="button" aria-label="Eliminar impulso de día ${imp.t}" style="padding: 2px 8px; min-height: 32px; min-width: 32px; color: var(--danger);">
          ✕
        </button>
      `
      row.querySelector('.btn-remove-impulse')?.addEventListener('click', () => {
        currentImpulses.splice(idx, 1)
        renderImpulses()
        runEdoSimulation()
      })
      impulsesContainer.appendChild(row)
    })
  }

  function runEdoSimulation(): void {
    const b = Number(sliderBeta?.value || 0.6)
    const g = Number(sliderGamma?.value || 0.2)
    if (valBeta) valBeta.textContent = b.toFixed(2)
    if (valGamma) valGamma.textContent = g.toFixed(2)

    const state = store.getState()
    const params = {
      ...state.params,
      beta: b,
      gamma: g,
    }

    const r0 = b / g
    const pc = criticalCoverage(r0)
    if (kpiPc) kpiPc.textContent = (pc * 100).toFixed(1) + '%'

    const comp = simulateEdoCampaign(params, currentImpulses, 60, { dt: 0.1 })
    edoChart.update(comp)

    if (kpiPrevented) kpiPrevented.textContent = Math.round(comp.preventedInfections).toString()
    if (kpiPeakRed) kpiPeakRed.textContent = Math.round(comp.peakReduction).toString()
  }

  sliderBeta?.addEventListener('input', runEdoSimulation)
  sliderGamma?.addEventListener('input', runEdoSimulation)

  btnAddImpulse?.addEventListener('click', () => {
    const nextDay = Math.min(50, (currentImpulses[currentImpulses.length - 1]?.t ?? 5) + 7)
    currentImpulses.push({ t: nextDay, p: 0.3 })
    renderImpulses()
    runEdoSimulation()
  })

  btnPresetCritical?.addEventListener('click', () => {
    const b = Number(sliderBeta?.value || 0.6)
    const g = Number(sliderGamma?.value || 0.2)
    const r0 = b / g
    const pc = criticalCoverage(r0)
    currentImpulses = [{ t: 2, p: Number(pc.toFixed(2)) }]
    renderImpulses()
    runEdoSimulation()
  })

  renderImpulses()
  runEdoSimulation()

  // Componentes de Red
  const strategyChart = createStrategyComparisonChart()
  const strategyTable = createStrategyTable()
  page.querySelector('.slot-strategy-chart')?.appendChild(strategyChart.el)
  page.querySelector('.slot-strategy-table')?.appendChild(strategyTable.el)

  const selectTopology = page.querySelector<HTMLSelectElement>('#select-topology')
  const sliderBudget = page.querySelector<HTMLInputElement>('#slider-budget')
  const valBudgetPct = page.querySelector<HTMLElement>('#val-budget-pct')
  const inputNetSeed = page.querySelector<HTMLInputElement>('#input-net-seed')
  const btnRunStrategies = page.querySelector<HTMLButtonElement>('.btn-run-strategies')
  const summaryBanner = page.querySelector<HTMLElement>('#strategy-summary-banner')
  const summaryText = page.querySelector<HTMLElement>('#strategy-summary-text')

  sliderBudget?.addEventListener('input', () => {
    if (valBudgetPct && sliderBudget) {
      valBudgetPct.textContent = sliderBudget.value + '%'
    }
  })

  function runNetworkEvaluation(): void {
    const topo = selectTopology?.value || 'ba'
    const budgetPct = Number(sliderBudget?.value || 15) / 100
    const seed = Number(inputNetSeed?.value || 42)
    const n = 300

    let graph
    if (topo === 'ba') {
      graph = generateBarabasiAlbert({ n, m: 2, seed })
    } else if (topo === 'ws') {
      graph = generateWattsStrogatz({ n, k: 4, p: 0.1, seed })
    } else {
      graph = generateErdosRenyi({ n, p: 4 / n, seed })
    }

    const report = evaluateStrategies({
      graph,
      budgetFraction: budgetPct,
      beta: 0.6,
      gamma: 0.2,
      i0: 2,
      seed,
      tMax: 50,
      dt: 0.2,
    })

    strategyChart.update(report)
    strategyTable.update(report)

    if (summaryBanner && summaryText) {
      summaryBanner.style.display = 'block'
      summaryText.textContent = `💡 ${report.summary}`
    }
  }

  btnRunStrategies?.addEventListener('click', runNetworkEvaluation)

  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 640px) {
      .control-layout {
        padding: var(--space-4) var(--space-3) !important;
      }
      .control-tabs {
        flex-direction: column;
      }
      .control-tabs .btn-tab {
        width: 100%;
        justify-content: center;
      }
    }
  `
  page.appendChild(style)

  return page
}
