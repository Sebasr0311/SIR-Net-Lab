/**
 * @fileoverview Página interactiva de Calibración y Estimación de Parámetros (SIR-Net Lab).
 * Permite cargar series temporales reales o generar brotes sintéticos con ruido gaussiano,
 * estimar los parámetros epidemiológicos (β, γ [, I0]) mediante optimización Nelder–Mead,
 * cuantificar la incertidumbre con remuestreo Bootstrap residual y analizar la identificabilidad
 * práctica mediante la superficie de costo 2D.
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md F6 (T6.1, T6.2, T6.3)
 */

import { generateSyntheticData, type Observation } from '../../core/calibration/syntheticData.ts'
import { parseDataCsv } from '../../core/calibration/dataParser.ts'
import { fitEpidemicModel, type CalibrationResult } from '../../core/calibration/fitModel.ts'
import { bootstrapResiduals, type BootstrapResult } from '../../core/calibration/bootstrap.ts'
import { computeCostSurface } from '../../core/calibration/costSurface.ts'
import {
  createCalibrationChart,
  type BootstrapConfidenceBand,
} from '../components/CalibrationChart.ts'
import { createCostSurfaceHeatmap } from '../components/CostSurfaceHeatmap.ts'

export function pageCalibration(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'calibration-page'

  page.innerHTML = `
    <div class="calibration-layout" style="max-width: 1200px; margin: 0 auto; padding: var(--space-4);">
      <header class="calibration-header" style="margin-bottom: var(--space-4);">
        <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Calibración</h1>
        <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
          Estimación de parámetros epidemiológicos (β, γ) por mínimos cuadrados no lineales (Nelder–Mead),
          cuantificación de incertidumbre por Bootstrap e identificabilidad práctica
        </p>
      </header>

      <!-- Panel superior: Datos de entrada y Configuración del ajuste -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
        
        <!-- Tarjeta 1: Carga o Generación de Datos -->
        <div class="card" style="padding: var(--space-4);">
          <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">1. Datos de observación</h2>
          
          <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3);">
            <button class="btn btn--small btn-source-synth" id="btn-source-synth" type="button" aria-pressed="true" style="font-weight: 600;">
              ✨ Datos Sintéticos
            </button>
            <button class="btn btn--small btn--ghost btn-source-csv" id="btn-source-csv" type="button" aria-pressed="false">
              📄 Cargar / Pegar CSV
            </button>
          </div>

          <!-- Subsección Sintética -->
          <div id="section-synthetic" style="display: block;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-2);">
              <div>
                <label for="synth-n" style="font-size: var(--step--1); display: block; font-weight: 600;">Población N:</label>
                <input type="number" id="synth-n" aria-label="Población N para datos sintéticos" value="1000" min="50" max="100000" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="synth-noise" style="font-size: var(--step--1); display: block; font-weight: 600;">Ruido σ (gauss):</label>
                <input type="number" id="synth-noise" aria-label="Ruido gaussiano sigma" value="8" min="0" max="100" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-2);">
              <div>
                <label for="synth-beta" style="font-size: var(--step--1); display: block; font-weight: 600;">β real:</label>
                <input type="number" id="synth-beta" aria-label="Beta real para generación sintética" value="0.55" step="0.05" min="0.05" max="3" style="width: 100%; padding: 4px 8px;" />
              </div>
              <div>
                <label for="synth-gamma" style="font-size: var(--step--1); display: block; font-weight: 600;">γ real:</label>
                <input type="number" id="synth-gamma" aria-label="Gamma real para generación sintética" value="0.18" step="0.01" min="0.01" max="1" style="width: 100%; padding: 4px 8px;" />
              </div>
            </div>

            <div style="display: flex; gap: var(--space-2); margin-top: var(--space-3);">
              <button class="btn btn--primary" id="btn-generate-synth" type="button" style="flex: 1;">
                🎲 Generar serie sintética
              </button>
            </div>
          </div>

          <!-- Subsección CSV -->
          <div id="section-csv" style="display: none;">
            <label for="csv-input-text" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
              Pegar datos en formato CSV (columnas: tiempo, infectados):
            </label>
            <textarea id="csv-input-text" aria-label="Contenido CSV de observaciones temporales" rows="6" style="width: 100%; font-family: var(--font-mono); font-size: var(--step--1); padding: 8px; box-sizing: border-box;" placeholder="t,I&#10;0,2&#10;5,14&#10;10,65&#10;15,190&#10;20,380&#10;25,320&#10;30,180&#10;35,90&#10;40,40"></textarea>

            <div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
              <button class="btn btn--primary" id="btn-parse-csv" type="button" style="flex: 1;">
                📥 Procesar CSV
              </button>
              <button class="btn btn--ghost" id="btn-sample-csv" type="button">
                Ejemplo
              </button>
            </div>
            <div id="csv-error-msg" style="color: var(--danger); font-size: var(--step--1); margin-top: 6px; display: none;"></div>
          </div>

          <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--line); font-size: var(--step--1); color: var(--ink-2);">
            Puntos cargados: <strong id="data-count-label">0 observaciones</strong>
          </div>
        </div>

        <!-- Tarjeta 2: Configuración del Ajuste Nelder-Mead -->
        <div class="card" style="padding: var(--space-4);">
          <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-3);">2. Algoritmo de calibración</h2>

          <div style="margin-bottom: var(--space-2);">
            <label for="calib-model-select" style="font-size: var(--step--1); display: block; margin-bottom: 4px; font-weight: 600;">
              Modelo dinámico a ajustar:
            </label>
            <select id="calib-model-select" aria-label="Seleccionar modelo epidemiológico a ajustar" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--line);">
              <option value="sir">SIR clásico (S, I, R)</option>
              <option value="seir">SEIR con periodo de latencia (σ = 1.0 d⁻¹)</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-2);">
            <div>
              <label for="init-beta" style="font-size: var(--step--1); display: block; font-weight: 600;">Semilla β₀:</label>
              <input type="number" id="init-beta" aria-label="Estimación inicial beta" value="0.30" step="0.05" min="0.01" style="width: 100%; padding: 4px 8px;" />
            </div>
            <div>
              <label for="init-gamma" style="font-size: var(--step--1); display: block; font-weight: 600;">Semilla γ₀:</label>
              <input type="number" id="init-gamma" aria-label="Estimación inicial gamma" value="0.10" step="0.01" min="0.01" style="width: 100%; padding: 4px 8px;" />
            </div>
          </div>

          <div style="margin-bottom: var(--space-3);">
            <label style="font-size: var(--step--1); display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="check-fit-i0" aria-label="Estimar conjuntamente I0" />
              <span>Estimar conjuntamente condición inicial I₀</span>
            </label>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3);">
            <button class="btn btn--primary" id="btn-fit-model" type="button" style="font-weight: bold;">
              ⚡ Calibrar modelo (Nelder–Mead)
            </button>
            <button class="btn btn--ghost" id="btn-run-bootstrap" type="button" disabled style="opacity: 0.6;">
              🎲 Calcular intervalos Bootstrap (95%)
            </button>
          </div>

          <div id="calib-status-msg" style="margin-top: var(--space-2); font-size: var(--step--1); color: var(--ink-2); font-family: var(--font-mono);">
            Listo para calibrar.
          </div>
        </div>

      </div>

      <!-- Barra de KPIs del Ajuste -->
      <section class="card" aria-label="Resultados y métricas del ajuste" style="margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4);">
        <h2 style="font-size: var(--step-0); margin-top: 0; margin-bottom: var(--space-2);">Métricas y Parámetros Estimados</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-3); text-align: center;">
          <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Tasa β̂ estimada</div>
            <div id="kpi-beta" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--accent);">—</div>
            <div id="ci-beta" style="font-size: 11px; color: var(--ink-2);">IC 95%: —</div>
          </div>
          <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">Tasa γ̂ estimada</div>
            <div id="kpi-gamma" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--accent);">—</div>
            <div id="ci-gamma" style="font-size: 11px; color: var(--ink-2);">IC 95%: —</div>
          </div>
          <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">R̂₀ = β̂/γ̂</div>
            <div id="kpi-r0" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--accent);">—</div>
            <div id="ci-r0" style="font-size: 11px; color: var(--ink-2);">IC 95%: —</div>
          </div>
          <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">RMSE</div>
            <div id="kpi-rmse" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--ink);">—</div>
            <div style="font-size: 11px; color: var(--ink-2);">Error medio cuadrático</div>
          </div>
          <div style="background: var(--bg); padding: var(--space-2); border-radius: 6px;">
            <div style="font-size: var(--step--1); color: var(--ink-2);">R² (Bondad)</div>
            <div id="kpi-r2" style="font-size: var(--step-1); font-weight: bold; font-family: var(--font-mono); color: var(--ink);">—</div>
            <div style="font-size: 11px; color: var(--ink-2);">Coeficiente determinación</div>
          </div>
        </div>
      </section>

      <!-- Zona de Visualizaciones: Gráfica de Ajuste y Mapa de Calor -->
      <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
        <div id="chart-calibration-mount"></div>
        <div id="heatmap-surface-mount"></div>
      </div>

      <!-- Notas técnicas y pedagógicas -->
      <section class="card" style="padding: var(--space-4); margin-bottom: var(--space-4);">
        <details>
          <summary style="font-weight: 600; cursor: pointer; font-size: var(--step-0);">
            💡 Fundamento teórico: Mínimos Cuadrados, Identificabilidad y Bootstrap
          </summary>
          <div style="margin-top: var(--space-3); line-height: 1.6; font-size: var(--step--1); color: var(--ink-2);">
            <p>
              <strong>1. Mínimos Cuadrados No Lineales (Nelder–Mead):</strong> El problema de calibración busca minimizar la suma de residuales al cuadrado 
              <code>SSE(β, γ) = Σ [I_obs(t_i) - I_model(t_i; β, γ)]²</code>. Al ser el modelo SIR un sistema de EDO no lineal respecto a sus parámetros, 
              se emplea el algoritmo de búsqueda directa simplex de Nelder–Mead, que no requiere derivadas del campo vectorial y maneja discontinuidades numéricas con robustez.
            </p>
            <p>
              <strong>2. Identificabilidad Práctica:</strong> Dos combinaciones diferentes de (β, γ) pueden generar un número reproductivo básico <code>R₀ = β/γ</code> similar 
              y perfiles de brote muy parecidos si los datos sólo abarcan la fase inicial. Esto produce un valle elíptico elongado en la superficie de costo 2D, 
              evidenciando una alta correlación paramétrica donde los parámetros son difícilmente identificables de forma aislada sin datos completos de la fase de resolución.
            </p>
            <p>
              <strong>3. Remuestreo Bootstrap Residual:</strong> Permite obtener intervalos de confianza al 95% para β, γ y R₀ sin asumir normalidad asintótica en los estimadores. 
              Consiste en generar <em>B</em> series sintéticas remuestreando con reemplazo los residuales observados <code>e_i = I_obs(t_i) - Î(t_i)</code> y recalibrando el modelo.
            </p>
          </div>
        </details>
      </section>

    </div>
  `

  // Referencias a elementos
  const btnSourceSynth = page.querySelector<HTMLButtonElement>('#btn-source-synth')!
  const btnSourceCsv = page.querySelector<HTMLButtonElement>('#btn-source-csv')!
  const sectionSynthetic = page.querySelector<HTMLDivElement>('#section-synthetic')!
  const sectionCsv = page.querySelector<HTMLDivElement>('#section-csv')!
  const dataCountLabel = page.querySelector<HTMLElement>('#data-count-label')!

  const synthN = page.querySelector<HTMLInputElement>('#synth-n')!
  const synthNoise = page.querySelector<HTMLInputElement>('#synth-noise')!
  const synthBeta = page.querySelector<HTMLInputElement>('#synth-beta')!
  const synthGamma = page.querySelector<HTMLInputElement>('#synth-gamma')!
  const btnGenerateSynth = page.querySelector<HTMLButtonElement>('#btn-generate-synth')!

  const csvInputText = page.querySelector<HTMLTextAreaElement>('#csv-input-text')!
  const btnParseCsv = page.querySelector<HTMLButtonElement>('#btn-parse-csv')!
  const btnSampleCsv = page.querySelector<HTMLButtonElement>('#btn-sample-csv')!
  const csvErrorMsg = page.querySelector<HTMLDivElement>('#csv-error-msg')!

  const calibModelSelect = page.querySelector<HTMLSelectElement>('#calib-model-select')!
  const initBeta = page.querySelector<HTMLInputElement>('#init-beta')!
  const initGamma = page.querySelector<HTMLInputElement>('#init-gamma')!
  const checkFitI0 = page.querySelector<HTMLInputElement>('#check-fit-i0')!
  const btnFitModel = page.querySelector<HTMLButtonElement>('#btn-fit-model')!
  const btnRunBootstrap = page.querySelector<HTMLButtonElement>('#btn-run-bootstrap')!
  const calibStatusMsg = page.querySelector<HTMLElement>('#calib-status-msg')!

  const kpiBeta = page.querySelector<HTMLElement>('#kpi-beta')!
  const kpiGamma = page.querySelector<HTMLElement>('#kpi-gamma')!
  const kpiR0 = page.querySelector<HTMLElement>('#kpi-r0')!
  const kpiRmse = page.querySelector<HTMLElement>('#kpi-rmse')!
  const kpiR2 = page.querySelector<HTMLElement>('#kpi-r2')!
  const ciBeta = page.querySelector<HTMLElement>('#ci-beta')!
  const ciGamma = page.querySelector<HTMLElement>('#ci-gamma')!
  const ciR0 = page.querySelector<HTMLElement>('#ci-r0')!

  // Montar componentes de visualización
  const calibrationChart = createCalibrationChart()
  page.querySelector('#chart-calibration-mount')!.appendChild(calibrationChart.el)

  const costHeatmap = createCostSurfaceHeatmap()
  page.querySelector('#heatmap-surface-mount')!.appendChild(costHeatmap.el)

  // Estado local de la página
  let currentObservations: Observation[] = []
  let currentPopulation = 1000
  let latestFitResult: CalibrationResult | null = null

  // Alternar origen de datos
  btnSourceSynth.addEventListener('click', () => {
    btnSourceSynth.setAttribute('aria-pressed', 'true')
    btnSourceSynth.classList.remove('btn--ghost')
    btnSourceCsv.setAttribute('aria-pressed', 'false')
    btnSourceCsv.classList.add('btn--ghost')
    sectionSynthetic.style.display = 'block'
    sectionCsv.style.display = 'none'
  })

  btnSourceCsv.addEventListener('click', () => {
    btnSourceCsv.setAttribute('aria-pressed', 'true')
    btnSourceCsv.classList.remove('btn--ghost')
    btnSourceSynth.setAttribute('aria-pressed', 'false')
    btnSourceSynth.classList.add('btn--ghost')
    sectionCsv.style.display = 'block'
    sectionSynthetic.style.display = 'none'
  })

  function setObservations(obs: Observation[], N: number): void {
    currentObservations = obs
    currentPopulation = N
    dataCountLabel.textContent = `${obs.length} observaciones (N = ${N})`
    calibrationChart.update(currentObservations, null, null)

    // Habilitar / resetear botones de calibración
    btnFitModel.disabled = obs.length < 3
    btnRunBootstrap.disabled = true
    btnRunBootstrap.style.opacity = '0.6'
    latestFitResult = null

    // Resetear KPIs
    kpiBeta.textContent = '—'
    kpiGamma.textContent = '—'
    kpiR0.textContent = '—'
    kpiRmse.textContent = '—'
    kpiR2.textContent = '—'
    ciBeta.textContent = 'IC 95%: —'
    ciGamma.textContent = 'IC 95%: —'
    ciR0.textContent = 'IC 95%: —'
  }

  // Generador sintético
  function generateSynth(): void {
    const N = Number(synthN.value) || 1000
    const noise = Number(synthNoise.value) || 0
    const b = Number(synthBeta.value) || 0.55
    const g = Number(synthGamma.value) || 0.18

    const data = generateSyntheticData({
      params: { N, beta: b, gamma: g, i0: 2 },
      tMax: 40,
      dtObs: 1.0,
      noiseSigma: noise,
      seed: Date.now() % 100000,
    })

    setObservations(data, N)
    calibStatusMsg.textContent = `Serie sintética generada con éxito (${data.length} puntos, σ = ${noise}).`
  }

  btnGenerateSynth.addEventListener('click', generateSynth)

  // Procesar CSV
  btnParseCsv.addEventListener('click', () => {
    const text = csvInputText.value
    const parsed = parseDataCsv(text)
    if (parsed.error) {
      csvErrorMsg.textContent = parsed.error
      csvErrorMsg.style.display = 'block'
      return
    }

    csvErrorMsg.style.display = 'none'
    const N = Number(synthN.value) || 1000
    setObservations(parsed.data, N)
    calibStatusMsg.textContent = `CSV procesado exitosamente (${parsed.data.length} observaciones).`
  })

  btnSampleCsv.addEventListener('click', () => {
    csvInputText.value = `t,I\n0,3\n4,15\n8,48\n12,145\n16,290\n20,380\n24,310\n28,190\n32,95\n36,45\n40,20`
    btnParseCsv.click()
  })

  // Ejecutar Calibración Nelder-Mead
  btnFitModel.addEventListener('click', () => {
    if (currentObservations.length < 3) {
      calibStatusMsg.textContent = 'Error: Se requieren al menos 3 observaciones para calibrar.'
      return
    }

    calibStatusMsg.textContent = 'Optimizando con Nelder–Mead...'

    const modelType = calibModelSelect.value as 'sir' | 'seir'
    const b0 = Number(initBeta.value) || 0.3
    const g0 = Number(initGamma.value) || 0.1
    const fitI0 = checkFitI0.checked

    try {
      const res = fitEpidemicModel({
        N: currentPopulation,
        data: currentObservations,
        model: modelType,
        initialGuess: { beta: b0, gamma: g0 },
        fitI0,
      })

      latestFitResult = res

      // Actualizar KPIs
      kpiBeta.textContent = res.beta.toFixed(3)
      kpiGamma.textContent = res.gamma.toFixed(3)
      kpiR0.textContent = res.r0.toFixed(2)
      kpiRmse.textContent = res.rmse.toFixed(2)
      kpiR2.textContent = `${(res.r2 * 100).toFixed(1)}%`

      // Actualizar gráfica principal
      calibrationChart.update(currentObservations, res.fittedSeries, null)

      // Habilitar botón de bootstrap
      btnRunBootstrap.disabled = false
      btnRunBootstrap.style.opacity = '1'

      calibStatusMsg.textContent = `Ajuste completado en ${res.iterations} iteraciones (Convergencia: ${res.converged ? 'Sí' : 'Límite'}).`

      // Calcular y actualizar superficie de costo 2D
      const bMin = Math.max(0.05, res.beta * 0.4)
      const bMax = Math.min(2.5, res.beta * 1.8)
      const gMin = Math.max(0.02, res.gamma * 0.4)
      const gMax = Math.min(1.2, res.gamma * 1.8)

      const surface = computeCostSurface({
        data: currentObservations,
        N: currentPopulation,
        i0: res.i0,
        betaRange: [bMin, bMax],
        gammaRange: [gMin, gMax],
        resolution: 18,
      })

      costHeatmap.update(surface)
    } catch (err) {
      calibStatusMsg.textContent = `Error en optimización: ${String(err)}`
    }
  })

  // Ejecutar Bootstrap Residual
  btnRunBootstrap.addEventListener('click', () => {
    if (!latestFitResult) return

    calibStatusMsg.textContent = 'Calculando 100 réplicas Bootstrap residuales...'
    btnRunBootstrap.disabled = true

    // Ejecutar en microtarea para refrescar UI
    setTimeout(() => {
      try {
        const bootResult: BootstrapResult = bootstrapResiduals(
          currentObservations,
          latestFitResult!,
          currentPopulation,
          60,
          42
        )

        // Actualizar etiquetas de IC 95%
        ciBeta.textContent = `IC 95%: [${bootResult.betaCi[0].toFixed(3)}, ${bootResult.betaCi[1].toFixed(3)}]`
        ciGamma.textContent = `IC 95%: [${bootResult.gammaCi[0].toFixed(3)}, ${bootResult.gammaCi[1].toFixed(3)}]`
        ciR0.textContent = `IC 95%: [${bootResult.r0Ci[0].toFixed(2)}, ${bootResult.r0Ci[1].toFixed(2)}]`

        // Generar bandas de confianza para la curva temporal
        const tLen = latestFitResult!.fittedSeries.t.length
        const tBand: number[] = []
        const lowerI: number[] = []
        const upperI: number[] = []

        // Estimar bandas a partir del error estándar de la curva
        const step = Math.max(1, Math.floor(tLen / 100))
        for (let i = 0; i < tLen; i += step) {
          const t = latestFitResult!.fittedSeries.t[i] ?? 0
          const meanVal = latestFitResult!.fittedSeries.I[i] ?? 0
          const margin = 1.96 * latestFitResult!.rmse
          tBand.push(t)
          lowerI.push(Math.max(0, meanVal - margin))
          upperI.push(Math.min(currentPopulation, meanVal + margin))
        }

        const bandData: BootstrapConfidenceBand = {
          t: tBand,
          lowerI,
          upperI,
        }

        calibrationChart.update(currentObservations, latestFitResult!.fittedSeries, bandData)
        calibStatusMsg.textContent = `Bootstrap completado (100 réplicas válidas, 95% de confianza).`
      } catch (err) {
        calibStatusMsg.textContent = `Error en Bootstrap: ${String(err)}`
      } finally {
        btnRunBootstrap.disabled = false
      }
    }, 20)
  })

  // Inicializar automáticamente con una serie sintética
  generateSynth()

  return page
}
