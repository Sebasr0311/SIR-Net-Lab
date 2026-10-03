/**
 * @fileoverview Página interactiva de Análisis de Sensibilidad y Barridos (SIR-Net Lab).
 * Integra sensibilidad local normalizada (gráfico tornado), barrido bidimensional de bifurcación
 * (β vs γ con frontera R₀=1) y análisis de sensibilidad global Monte Carlo con Latin Hypercube Sampling (LHS).
 *
 * @see docs/02-modelo-matematico.md §2.7
 * @see docs/06-plan-de-trabajo.md F7 (T7.1, T7.2, T7.3)
 */

import { store } from '../../state/store.ts'
import {
  computeLocalSensitivity,
  type SensitivityMetric,
  type LocalSensitivityReport,
} from '../../core/sensitivity/localSensitivity.ts'
import { computeSweep2D, type Sweep2DResult } from '../../core/sensitivity/sweep2d.ts'
import type { GlobalSensitivityResult } from '../../core/sensitivity/globalSensitivity.ts'
import { createTornadoChart } from '../components/TornadoChart.ts'
import { createSweepHeatmap } from '../components/SweepHeatmap.ts'
import { createMonteCarloHistogram } from '../components/MonteCarloHistogram.ts'

export function pageSensitivity(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'sensitivity-page'

  page.innerHTML = `
    <div class="sensitivity-layout" style="max-width: 1200px; margin: 0 auto; padding: var(--space-4);">
      <header class="sensitivity-header" style="margin-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Sensibilidad</h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
          Impacto de incertidumbres paramétricas: elasticidades locales (tornado), bifurcación 2D y Monte Carlo LHS
        </p>
      </header>

      <!-- Pestañas de navegación de modo de sensibilidad -->
      <div class="sensitivity-tabs" role="tablist" aria-label="Modo de análisis de sensibilidad" style="display: flex; gap: var(--space-2); margin-bottom: var(--space-4); border-bottom: 1px solid var(--line); padding-bottom: var(--space-2); flex-wrap: wrap;">
        <button class="btn btn-tab btn-tab-tornado" role="tab" aria-selected="true" aria-controls="panel-tornado" id="tab-tornado" type="button" style="font-weight: 600;">
          🌪️ Sensibilidad Local (Tornado)
        </button>
        <button class="btn btn-tab btn-tab-sweep btn--ghost" role="tab" aria-selected="false" aria-controls="panel-sweep" id="tab-sweep" type="button">
          🗺️ Barrido 2D y Bifurcación (β vs γ)
        </button>
        <button class="btn btn-tab btn-tab-lhs btn--ghost" role="tab" aria-selected="false" aria-controls="panel-lhs" id="tab-lhs" type="button">
          🎲 Sensibilidad Global (LHS en Worker)
        </button>
      </div>

      <!-- Panel 1: Sensibilidad Local (Tornado) -->
      <section id="panel-tornado" role="tabpanel" aria-labelledby="tab-tornado" style="display: block;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          
          <!-- Controles de Sensibilidad Local -->
          <div class="card" style="padding: var(--space-4);">
            <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">Métrica objetivo y punto base</h2>
            
            <div style="margin-bottom: var(--space-3);">
              <label for="select-tornado-metric" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Métrica de salida Y:
              </label>
              <select id="select-tornado-metric" aria-label="Seleccionar métrica para el análisis de tornado" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--line);">
                <option value="peakI">Pico de infección máximo (I_max)</option>
                <option value="r0">Número reproductivo básico (R₀ = β/γ)</option>
                <option value="attackRate">Tasa de ataque final (Fracción infectada)</option>
                <option value="peakTime">Tiempo al pico (t_pico)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-3);">
              <div>
                <label for="local-beta" style="font-size: var(--step--1); display: block; font-weight: 600;">β base:</label>
                <input type="number" id="local-beta" aria-label="Beta base para sensibilidad local" value="0.6" step="0.05" min="0.05" max="3" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="local-gamma" style="font-size: var(--step--1); display: block; font-weight: 600;">γ base:</label>
                <input type="number" id="local-gamma" aria-label="Gamma base para sensibilidad local" value="0.2" step="0.01" min="0.01" max="1" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <div style="font-size: var(--step--1); color: var(--ink-2); line-height: 1.5; background: var(--bg); padding: var(--space-3); border-radius: 6px;">
              <div>Valor base de la métrica Y: <strong id="local-base-val" style="color: var(--accent); font-family: var(--font-mono);">—</strong></div>
              <div style="margin-top: 4px;">Parámetro más influyente: <strong id="local-top-param" style="color: var(--ink);">—</strong></div>
            </div>
          </div>

          <!-- Montaje del Gráfico Tornado -->
          <div id="tornado-chart-mount"></div>

        </div>
      </section>

      <!-- Panel 2: Barrido 2D y Bifurcación -->
      <section id="panel-sweep" role="tabpanel" aria-labelledby="tab-sweep" style="display: none;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          
          <!-- Controles del Barrido 2D -->
          <div class="card" style="padding: var(--space-4);">
            <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">Espacio de búsqueda 2D</h2>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-2);">
              <div>
                <label for="sweep-beta-min" style="font-size: var(--step--1); display: block; font-weight: 600;">β min:</label>
                <input type="number" id="sweep-beta-min" aria-label="Beta mínimo para barrido" value="0.05" step="0.05" min="0.01" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="sweep-beta-max" style="font-size: var(--step--1); display: block; font-weight: 600;">β max:</label>
                <input type="number" id="sweep-beta-max" aria-label="Beta máximo para barrido" value="1.2" step="0.05" min="0.1" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-3);">
              <div>
                <label for="sweep-gamma-min" style="font-size: var(--step--1); display: block; font-weight: 600;">γ min:</label>
                <input type="number" id="sweep-gamma-min" aria-label="Gamma mínimo para barrido" value="0.05" step="0.05" min="0.01" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="sweep-gamma-max" style="font-size: var(--step--1); display: block; font-weight: 600;">γ max:</label>
                <input type="number" id="sweep-gamma-max" aria-label="Gamma máximo para barrido" value="0.6" step="0.05" min="0.1" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <button class="btn btn--primary" id="btn-recompute-sweep" type="button" style="width: 100%;">
              🔄 Actualizar paisaje 2D
            </button>

            <div style="margin-top: var(--space-3); font-size: var(--step--1); color: var(--ink-2); line-height: 1.5;">
              La línea blanca discontinua representa <strong>R₀ = 1 (β = γ)</strong>. Separa la zona de extinción inmediata de la zona endémica/epidémica con brote.
            </div>
          </div>

          <!-- Montaje del Heatmap 2D -->
          <div id="sweep-heatmap-mount"></div>

        </div>
      </section>

      <!-- Panel 3: Sensibilidad Global (LHS en Worker) -->
      <section id="panel-lhs" role="tabpanel" aria-labelledby="tab-lhs" style="display: none;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
          
          <!-- Controles de LHS -->
          <div class="card" style="padding: var(--space-4);">
            <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">Muestreo por Hipercubo Latino (LHS)</h2>

            <div style="margin-bottom: var(--space-2);">
              <label for="lhs-sample-count" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
                Número de réplicas Monte Carlo M: <span id="val-lhs-count">1000</span>
              </label>
              <input type="range" id="lhs-sample-count" aria-label="Número de muestras para LHS" min="200" max="2500" step="100" value="1000" style="width: 100%;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-2);">
              <div>
                <label for="lhs-beta-range" style="font-size: var(--step--1); display: block; font-weight: 600;">Rango β:</label>
                <input type="text" id="lhs-beta-range" aria-label="Rango de beta min y max" value="0.2 - 0.8" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="lhs-gamma-range" style="font-size: var(--step--1); display: block; font-weight: 600;">Rango γ:</label>
                <input type="text" id="lhs-gamma-range" aria-label="Rango de gamma min y max" value="0.1 - 0.4" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <button class="btn btn--primary" id="btn-run-lhs" type="button" style="width: 100%; margin-top: var(--space-2); font-weight: bold;">
              ⚡ Ejecutar simulación LHS (Worker)
            </button>

            <div id="lhs-status-msg" style="margin-top: var(--space-2); font-size: var(--step--1); color: var(--ink-2); font-family: var(--font-mono);">
              Listo para muestreo en segundo plano.
            </div>
          </div>

          <!-- Métricas agregadas de riesgo -->
          <div class="card" style="padding: var(--space-4);">
            <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">Evaluación de Riesgo Epidémico</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); text-align: center;">
              <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
                <div style="font-size: var(--step--1); color: var(--ink-2);">P(Brote) [R₀ > 1]</div>
                <div id="kpi-lhs-outbreak" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--danger);">—</div>
              </div>
              <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
                <div style="font-size: var(--step--1); color: var(--ink-2);">P(Severo) [I > 10%N]</div>
                <div id="kpi-lhs-severe" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--danger);">—</div>
              </div>
              <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
                <div style="font-size: var(--step--1); color: var(--ink-2);">Media I_max</div>
                <div id="kpi-lhs-mean" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--ink);">—</div>
              </div>
              <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
                <div style="font-size: var(--step--1); color: var(--ink-2);">IC 90% (p5 – p95)</div>
                <div id="kpi-lhs-ci" style="font-size: var(--step--1); font-weight: bold; font-family: var(--font-mono); color: var(--accent); margin-top: 6px;">—</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Montaje del Histograma Monte Carlo -->
        <div id="lhs-histogram-mount" style="margin-bottom: var(--space-4);"></div>

      </section>

      <!-- Sección teórica y pedagógica -->
      <section class="card" style="padding: var(--space-4); margin-bottom: var(--space-4);">
        <details>
          <summary style="font-weight: 600; cursor: pointer; font-size: var(--step-0);">
            💡 Fundamentos de Sensibilidad: Elasticidad, Bifurcación y Muestreo LHS
          </summary>
          <div style="margin-top: var(--space-3); line-height: 1.6; font-size: var(--step--1); color: var(--ink-2);">
            <p>
              <strong>1. Índices de Elasticidad Normalizada:</strong> Miden la variación porcentual de una variable de salida ante una perturbación del 1% en un parámetro:
              <code>S_p^Y = (∂Y/∂p)·(p/Y)</code>. Un índice positivo indica una relación directamente proporcional (por ejemplo, β con el pico de infección), 
              mientras que un índice negativo indica mitigación (por ejemplo, γ con el pico).
            </p>
            <p>
              <strong>2. Bifurcación Transcrítica:</strong> La línea <code>R₀ = β/γ = 1</code> divide el espacio fase en dos regímenes cualitativamente disyuntos:
              si <code>β &lt; γ</code>, el equilibrio libre de infección es asintóticamente estable y el malware se extingue sin brote; si <code>β &gt; γ</code>, 
              el equilibrio libre de infección pierde estabilidad y emerge un brote epidémico.
            </p>
            <p>
              <strong>3. Latin Hypercube Sampling (LHS):</strong> Divide el dominio de cada parámetro en M intervalos equiprobables y asegura que cada intervalo 
              sea muestreado exactamente una vez en una combinación aleatoria. Esto reduce drásticamente la varianza del estimador en comparación con el muestreo 
              Monte Carlo aleatorio estándar, alcanzando convergencia estadística con un número de simulaciones significativamente menor.
            </p>
          </div>
        </details>
      </section>

    </div>
  `

  // Pestañas
  const tabTornado = page.querySelector<HTMLButtonElement>('#tab-tornado')!
  const tabSweep = page.querySelector<HTMLButtonElement>('#tab-sweep')!
  const tabLhs = page.querySelector<HTMLButtonElement>('#tab-lhs')!
  const panelTornado = page.querySelector<HTMLElement>('#panel-tornado')!
  const panelSweep = page.querySelector<HTMLElement>('#panel-sweep')!
  const panelLhs = page.querySelector<HTMLElement>('#panel-lhs')!

  function switchTab(active: 'tornado' | 'sweep' | 'lhs'): void {
    const tabs = [
      { id: 'tornado', btn: tabTornado, panel: panelTornado },
      { id: 'sweep', btn: tabSweep, panel: panelSweep },
      { id: 'lhs', btn: tabLhs, panel: panelLhs },
    ]

    for (const t of tabs) {
      const isCurrent = t.id === active
      t.btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false')
      t.btn.classList.toggle('btn--ghost', !isCurrent)
      t.panel.style.display = isCurrent ? 'block' : 'none'
    }
    window.dispatchEvent(new Event('resize'))
  }

  tabTornado.addEventListener('click', () => switchTab('tornado'))
  tabSweep.addEventListener('click', () => switchTab('sweep'))
  tabLhs.addEventListener('click', () => switchTab('lhs'))

  // Componentes de visualización
  const tornadoChart = createTornadoChart()
  page.querySelector('#tornado-chart-mount')!.appendChild(tornadoChart.el)

  const sweepHeatmap = createSweepHeatmap()
  page.querySelector('#sweep-heatmap-mount')!.appendChild(sweepHeatmap.el)

  const monteCarloHistogram = createMonteCarloHistogram()
  page.querySelector('#lhs-histogram-mount')!.appendChild(monteCarloHistogram.el)

  // Referencias a inputs de Sensibilidad Local
  const selectMetric = page.querySelector<HTMLSelectElement>('#select-tornado-metric')!
  const localBeta = page.querySelector<HTMLInputElement>('#local-beta')!
  const localGamma = page.querySelector<HTMLInputElement>('#local-gamma')!
  const localBaseVal = page.querySelector<HTMLElement>('#local-base-val')!
  const localTopParam = page.querySelector<HTMLElement>('#local-top-param')!

  function updateTornado(): void {
    const metric = selectMetric.value as SensitivityMetric
    const b = Number(localBeta.value) || 0.6
    const g = Number(localGamma.value) || 0.2
    const currentParams = {
      ...store.getState().params,
      beta: b,
      gamma: g,
    }

    const report: LocalSensitivityReport = computeLocalSensitivity(currentParams, metric)
    tornadoChart.update(report)

    localBaseVal.textContent =
      metric === 'r0'
        ? report.baseValue.toFixed(2)
        : metric === 'attackRate'
          ? `${(report.baseValue * 100).toFixed(1)}%`
          : report.baseValue.toFixed(1)

    const top = report.parameters[0]
    if (top) {
      localTopParam.textContent = `${top.param.toUpperCase()} (|S| = ${top.absoluteIndex})`
    }
  }

  selectMetric.addEventListener('change', updateTornado)
  localBeta.addEventListener('input', updateTornado)
  localGamma.addEventListener('input', updateTornado)

  // Referencias a inputs del Barrido 2D
  const sweepBetaMin = page.querySelector<HTMLInputElement>('#sweep-beta-min')!
  const sweepBetaMax = page.querySelector<HTMLInputElement>('#sweep-beta-max')!
  const sweepGammaMin = page.querySelector<HTMLInputElement>('#sweep-gamma-min')!
  const sweepGammaMax = page.querySelector<HTMLInputElement>('#sweep-gamma-max')!
  const btnRecomputeSweep = page.querySelector<HTMLButtonElement>('#btn-recompute-sweep')!

  function updateSweep(): void {
    const bMin = Number(sweepBetaMin.value) || 0.05
    const bMax = Number(sweepBetaMax.value) || 1.2
    const gMin = Number(sweepGammaMin.value) || 0.05
    const gMax = Number(sweepGammaMax.value) || 0.6
    const N = store.getState().params.N

    const sweepResult: Sweep2DResult = computeSweep2D({
      N,
      i0: store.getState().params.i0 || 1,
      betaRange: [bMin, bMax],
      gammaRange: [gMin, gMax],
      resolution: 20,
    })

    sweepHeatmap.update(sweepResult)
  }

  btnRecomputeSweep.addEventListener('click', updateSweep)

  // Referencias a inputs de LHS
  const sliderLhsCount = page.querySelector<HTMLInputElement>('#lhs-sample-count')!
  const valLhsCount = page.querySelector<HTMLElement>('#val-lhs-count')!
  const btnRunLhs = page.querySelector<HTMLButtonElement>('#btn-run-lhs')!
  const lhsStatusMsg = page.querySelector<HTMLElement>('#lhs-status-msg')!
  const kpiLhsOutbreak = page.querySelector<HTMLElement>('#kpi-lhs-outbreak')!
  const kpiLhsSevere = page.querySelector<HTMLElement>('#kpi-lhs-severe')!
  const kpiLhsMean = page.querySelector<HTMLElement>('#kpi-lhs-mean')!
  const kpiLhsCi = page.querySelector<HTMLElement>('#kpi-lhs-ci')!

  sliderLhsCount.addEventListener('input', () => {
    valLhsCount.textContent = sliderLhsCount.value
  })

  // Instanciar Worker
  let sensitivityWorker: Worker | null = null
  try {
    sensitivityWorker = new Worker(
      new URL('../../workers/sensitivity.worker.ts', import.meta.url),
      { type: 'module' }
    )
  } catch {
    // Entorno de prueba o fallback
    sensitivityWorker = null
  }

  function handleLhsResult(result: GlobalSensitivityResult): void {
    kpiLhsOutbreak.textContent = `${(result.outbreakProbability * 100).toFixed(1)}%`
    kpiLhsSevere.textContent = `${(result.severeOutbreakProbability * 100).toFixed(1)}%`
    kpiLhsMean.textContent = `${result.peakIDist.mean}`
    kpiLhsCi.textContent = `[${result.peakIDist.p5}, ${result.peakIDist.p95}]`

    monteCarloHistogram.update(result.peakIDist)
    btnRunLhs.disabled = false
    lhsStatusMsg.textContent = `LHS completado con éxito (${result.sampleCount} réplicas).`
  }

  if (sensitivityWorker) {
    sensitivityWorker.onmessage = (event: MessageEvent): void => {
      const data = event.data
      if (data.type === 'LHS_RESULT') {
        handleLhsResult(data.result)
      } else if (data.type === 'ERROR') {
        lhsStatusMsg.textContent = `Error: ${data.error}`
        btnRunLhs.disabled = false
      }
    }
  }

  btnRunLhs.addEventListener('click', () => {
    const sampleCount = Number(sliderLhsCount.value) || 1000
    const N = store.getState().params.N

    lhsStatusMsg.textContent = `Ejecutando ${sampleCount} simulaciones LHS en worker...`
    btnRunLhs.disabled = true

    const ranges = [
      { name: 'beta', min: 0.2, max: 0.8 },
      { name: 'gamma', min: 0.1, max: 0.4 },
    ]

    if (sensitivityWorker) {
      sensitivityWorker.postMessage({
        type: 'RUN_LHS',
        id: Date.now(),
        N,
        i0: store.getState().params.i0 || 2,
        ranges,
        sampleCount,
        seed: 42,
      })
    } else {
      // Fallback síncrono si no hay Worker disponible
      setTimeout(() => {
        import('../../core/sensitivity/globalSensitivity.ts').then(({ runGlobalSensitivity }) => {
          const res = runGlobalSensitivity({
            N,
            i0: store.getState().params.i0 || 2,
            ranges,
            sampleCount,
            seed: 42,
          })
          handleLhsResult(res)
        })
      }, 50)
    }
  })

  // Inicialización de componentes al cargar la página
  updateTornado()
  updateSweep()
  // Lanzar un lote inicial de LHS
  btnRunLhs.click()

  return page
}
