/**
 * @fileoverview Panel de parámetros del simulador EDO con acordeón accesible,
 * sincronización con el store reactivo, validación y gestión de escenarios.
 * (SIR-Net Lab — docs/05 & T3.1)
 */

import { store, type AppState } from '../../state/store.ts'
import { SCENARIOS } from '../../state/scenarios.ts'
import { createSliderField } from './SliderField.ts'
import { createSegmentedControl } from './SegmentedControl.ts'
import { createAccordion } from './Accordion.ts'

export interface ParamPanelHandle {
  el: HTMLElement
  destroy: () => void
}

export function createParamPanel(): ParamPanelHandle {
  const container = document.createElement('aside')
  container.className = 'param-panel'
  container.setAttribute('aria-label', 'Panel de parámetros del simulador')

  // --- Cabecera del panel ---
  const header = document.createElement('div')
  header.className = 'param-panel__header'
  header.innerHTML = `
    <h2>Parámetros</h2>
    <p class="text-muted">Ajusta las variables del modelo en tiempo real</p>
  `
  container.appendChild(header)

  // --- Selector de escenarios predefinidos ---
  const scenarioBox = document.createElement('div')
  scenarioBox.className = 'card scenario-box'
  scenarioBox.style.cssText =
    'margin-bottom: var(--space-4); padding: var(--space-3) var(--space-4);'
  scenarioBox.innerHTML = `
    <label for="scenario-select" style="font-size: var(--step--1); font-weight: 600; display: block; margin-bottom: 4px;">
      Escenarios predefinidos (§2.8)
    </label>
    <select id="scenario-select" class="select-field" style="width: 100%; padding: var(--space-2); border-radius: 6px; border: 1px solid var(--line); font-family: var(--font-ui); background: var(--surface); color: var(--ink);">
      <option value="">Personalizado...</option>
      ${Object.values(SCENARIOS)
        .map((sc) => `<option value="${sc.id}">${sc.name}</option>`)
        .join('')}
    </select>
  `
  container.appendChild(scenarioBox)

  const scenarioSelect = scenarioBox.querySelector<HTMLSelectElement>('#scenario-select')

  // --- Secciones de acordeón ---
  const state = store.getState()

  // 1. Población
  const secPoblacion = document.createElement('div')
  secPoblacion.className = 'stack'

  const sliderN = createSliderField({
    label: 'N — Población total',
    min: 100,
    max: 50000,
    step: 100,
    value: state.params.N,
    unit: 'nodos',
    description: 'Población total de equipos o usuarios en la red.',
    onChange: (N) => {
      const current = store.getState()
      const i0 = Math.min(current.params.i0, N - 1)
      store.setState({
        params: { ...current.params, N, i0 },
      })
    },
  })

  const sliderI0 = createSliderField({
    label: 'I₀ — Infectados iniciales',
    min: 1,
    max: 500,
    step: 1,
    value: state.params.i0,
    unit: 'nodos',
    description: 'Cantidad de equipos infectados en el instante inicial t = 0.',
    onChange: (i0) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, i0 },
      })
    },
  })

  secPoblacion.appendChild(sliderN)
  secPoblacion.appendChild(sliderI0)

  // 2. Epidemia
  const secEpidemia = document.createElement('div')
  secEpidemia.className = 'stack'

  const sliderBeta = createSliderField({
    label: 'β — Tasa de transmisión',
    min: 0.01,
    max: 2.0,
    step: 0.01,
    value: state.params.beta,
    unit: 'días⁻¹',
    description: 'Contactos efectivos por unidad de tiempo. R₀ = β / γ.',
    onChange: (beta) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, beta },
      })
    },
  })

  const sliderGamma = createSliderField({
    label: 'γ — Tasa de recuperación / limpieza',
    min: 0.01,
    max: 1.0,
    step: 0.01,
    value: state.params.gamma,
    unit: 'días⁻¹',
    description: '1/γ representa el tiempo medio infeccioso antes de ser aislado o limpiado.',
    onChange: (gamma) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, gamma },
      })
    },
  })

  const sliderSigma = createSliderField({
    label: 'σ — Tasa de incubación (SEIR)',
    min: 0.05,
    max: 5.0,
    step: 0.05,
    value: state.params.sigma ?? 1.0,
    unit: 'días⁻¹',
    description:
      '1/σ es el período de latencia durante el cual el nodo está expuesto pero no transmite.',
    onChange: (sigma) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, sigma },
      })
    },
  })

  secEpidemia.appendChild(sliderBeta)
  secEpidemia.appendChild(sliderGamma)
  secEpidemia.appendChild(sliderSigma)

  // 3. Control y mitigación
  const secControl = document.createElement('div')
  secControl.className = 'stack'

  const sliderNu = createSliderField({
    label: 'ν — Tasa de parcheo preventivo',
    min: 0,
    max: 0.5,
    step: 0.01,
    value: state.params.nu ?? 0,
    unit: 'días⁻¹',
    description: 'Inmunización proactiva de susceptibles antes de ser alcanzados por el contagio.',
    onChange: (nu) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, nu },
      })
    },
  })

  const sliderC = createSliderField({
    label: 'c — Efectividad de aislamiento',
    min: 0,
    max: 1.0,
    step: 0.05,
    value: state.params.c ?? 0,
    unit: 'fracción',
    description: 'Reducción del ritmo de transmisión por segmentación de red.',
    onChange: (c) => {
      const current = store.getState()
      store.setState({
        params: { ...current.params, c },
      })
    },
  })

  secControl.appendChild(sliderNu)
  secControl.appendChild(sliderC)

  // 4. Configuración numérica
  const secMetodo = document.createElement('div')
  secMetodo.className = 'stack'

  const labelModel = document.createElement('label')
  labelModel.style.cssText = 'font-size: var(--step--1); font-weight:600;'
  labelModel.textContent = 'Modelo dinámico'
  const segModel = createSegmentedControl({
    options: [
      { label: 'SIR', value: 'sir' },
      { label: 'SEIR', value: 'seir' },
      { label: 'SEIS', value: 'seis' },
    ],
    selected: state.model,
    onChange: (val) => {
      store.setState({ model: val as 'sir' | 'seir' | 'seis' })
    },
    ariaLabel: 'Selección de modelo epidemiológico',
  })

  const labelSolver = document.createElement('label')
  labelSolver.style.cssText =
    'font-size: var(--step--1); font-weight:600; margin-top: var(--space-2);'
  labelSolver.textContent = 'Solucionador numérico'
  const segSolver = createSegmentedControl({
    options: [
      { label: 'RK4', value: 'rk4' },
      { label: 'DOPRI5', value: 'dopri5' },
      { label: 'Euler', value: 'euler' },
    ],
    selected: state.solver,
    onChange: (val) => {
      store.setState({ solver: val as 'euler' | 'rk4' | 'dopri5' })
    },
    ariaLabel: 'Selección de solucionador numérico',
  })

  const sliderTMax = createSliderField({
    label: 't_max — Tiempo de simulación',
    min: 10,
    max: 180,
    step: 5,
    value: state.tMax,
    unit: 'días',
    description: 'Horizonte temporal de la integración numérica.',
    onChange: (tMax) => {
      store.setState({ tMax })
    },
  })

  const sliderDt = createSliderField({
    label: 'Δt — Paso de integración',
    min: 0.01,
    max: 0.5,
    step: 0.01,
    value: state.dt,
    unit: 'días',
    description: 'Paso fijo para RK4 y Euler.',
    onChange: (dt) => {
      store.setState({ dt })
    },
  })

  secMetodo.appendChild(labelModel)
  secMetodo.appendChild(segModel)
  secMetodo.appendChild(labelSolver)
  secMetodo.appendChild(segSolver)
  secMetodo.appendChild(sliderTMax)
  secMetodo.appendChild(sliderDt)

  const accordion = createAccordion([
    { title: 'Población y focos', content: secPoblacion, open: true },
    { title: 'Dinámica epidémica', content: secEpidemia, open: true },
    { title: 'Contención y control', content: secControl, open: false },
    { title: 'Método numérico', content: secMetodo, open: false },
  ])

  container.appendChild(accordion)

  // --- Acciones de Importación / Exportación JSON ---
  const ioBox = document.createElement('div')
  ioBox.className = 'param-panel__io'
  ioBox.style.cssText = 'display: flex; gap: var(--space-2); margin-top: var(--space-4);'
  ioBox.innerHTML = `
    <button class="btn btn--ghost btn-export-json" type="button" style="flex:1;">
      💾 Guardar JSON
    </button>
    <label class="btn btn--ghost" style="flex:1; cursor:pointer; text-align:center;">
      📂 Cargar JSON
      <input type="file" accept=".json" class="input-import-json" style="display:none;" />
    </label>
  `
  container.appendChild(ioBox)

  // Mensaje de feedback de importación
  const feedbackMsg = document.createElement('p')
  feedbackMsg.style.cssText =
    'font-size: var(--step--1); margin-top: var(--space-2); display: none;'
  container.appendChild(feedbackMsg)

  // Manejo de escenario predefinido
  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', () => {
      const selectedId = scenarioSelect.value
      if (selectedId && SCENARIOS[selectedId]) {
        const sc = SCENARIOS[selectedId]
        store.setState(sc.state)
      }
    })
  }

  // Exportar JSON
  const btnExportJson = ioBox.querySelector<HTMLButtonElement>('.btn-export-json')
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const current = store.getState()
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(current, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', 'sir-net-lab-config.json')
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
    })
  }

  // Cargar JSON
  const inputImportJson = ioBox.querySelector<HTMLInputElement>('.input-import-json')
  if (inputImportJson) {
    inputImportJson.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event): void => {
        try {
          const content = event.target?.result as string
          const parsed = JSON.parse(content) as Partial<AppState>

          if (!parsed.params || typeof parsed.params.N !== 'number') {
            throw new Error('El archivo no contiene un formato de escenario válido.')
          }

          store.setState(parsed)
          feedbackMsg.textContent = '✓ Escenario cargado exitosamente.'
          feedbackMsg.style.color = 'var(--ok)'
          feedbackMsg.style.display = 'block'
        } catch (err) {
          feedbackMsg.textContent = `✕ Error al importar: ${err instanceof Error ? err.message : 'Archivo no válido'}`
          feedbackMsg.style.color = 'var(--danger)'
          feedbackMsg.style.display = 'block'
        }
      }
      reader.readAsText(file)
    })
  }

  // Estilos del panel
  const style = document.createElement('style')
  style.textContent = `
    .param-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      width: 100%;
    }
    .param-panel__header h2 {
      font-size: var(--step-1);
    }
  `
  container.appendChild(style)

  return {
    el: container,
    destroy(): void {},
  }
}
