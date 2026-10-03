/**
 * @fileoverview Página de simulación en redes complejas (SIR-Net Lab).
 * Permite generar topologías ER, WS, BA, visualizar la propagación
 * estocástica nodo a nodo y contrastar el promedio de M corridas contra la EDO.
 * (docs/05, docs/06 F4)
 */

import { generateGraphAsync, runBatchAsync } from '../../workers/networkClient.ts'
import type { Graph, NetworkMetrics } from '../../sim/graphs/types.ts'
import { createNetworkCanvas } from '../components/NetworkCanvas.ts'
import { createNetworkComparisonChart } from '../components/NetworkComparisonChart.ts'
import { createSliderField } from '../components/SliderField.ts'
import { createSegmentedControl } from '../components/SegmentedControl.ts'
import { createKpiCard } from '../components/KpiCard.ts'

export function pageNetwork(): HTMLElement {
  const page = document.createElement('div')
  page.className = 'network-page'

  page.innerHTML = `
    <div class="network-layout">
      <div class="network-sidebar"></div>
      <div class="network-main">
        <header class="network-header" style="margin-bottom: var(--space-2);">
          <h1 style="font-size: var(--step-2); margin-bottom: var(--space-1);">Red</h1>
          <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1);">
            Simulación del contagio nodo a nodo sobre diferentes estructuras de red (aleatoria, mundo pequeño y libre de escala)
          </p>
        </header>

        <div class="network-kpis-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4);"></div>

        <div class="network-canvas-slot"></div>
        <div class="network-comparison-slot" style="margin-top: var(--space-6);"></div>

        <div class="card network-theory-box" style="margin-top: var(--space-6); border-left: 4px solid var(--accent);">
          <h3 style="font-size: var(--step-0); margin-bottom: var(--space-2);">💡 ¿Por qué una red real se comporta distinto a una fórmula promedio?</h3>
          <p style="font-size: var(--step--1); line-height: 1.6; color: var(--ink-2);">
            Las fórmulas matemáticas tradicionales asumen que cada computadora tiene exactamente la misma probabilidad de infectar a cualquier otra.
            En cambio, en redes reales existen <strong>servidores centrales o equipos superconectados (hubs)</strong>. Si el malware alcanza uno de estos nodos clave, el contagio se dispara de inmediato por toda la red, superando con creces la velocidad prevista por un modelo promedio homogéneo.
          </p>
        </div>
      </div>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    .network-page {
      padding: var(--space-6);
      max-width: 1440px;
      margin: 0 auto;
    }
    .network-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--space-6);
      align-items: start;
    }
    .network-sidebar {
      position: sticky;
      top: 72px;
      max-height: calc(100vh - 90px);
      overflow-y: auto;
      padding-right: var(--space-2);
    }
    .network-main {
      min-width: 0;
    }
    @media (max-width: 960px) {
      .network-layout {
        grid-template-columns: 1fr;
      }
      .network-sidebar {
        position: static;
        max-height: none;
        padding-right: 0;
      }
    }
    @media (max-width: 640px) {
      .network-page {
        padding: var(--space-4) var(--space-3);
      }
      .network-layout {
        gap: var(--space-4);
      }
    }
  `
  page.appendChild(style)

  // Ranuras de UI
  const sidebarSlot = page.querySelector<HTMLElement>('.network-sidebar')
  const kpisSlot = page.querySelector<HTMLElement>('.network-kpis-grid')
  const canvasSlot = page.querySelector<HTMLElement>('.network-canvas-slot')
  const comparisonSlot = page.querySelector<HTMLElement>('.network-comparison-slot')

  // Tarjetas KPI de red
  const cardMeanK = createKpiCard({
    label: 'Grado medio ⟨k⟩',
    value: '6.0',
    description: 'Promedio de conexiones por nodo',
    id: 'kpi-mean-k',
  })
  const cardK2 = createKpiCard({
    label: 'Segundo momento ⟨k²⟩',
    value: '42.0',
    description: 'Segundo momento de la distribución de grado',
    id: 'kpi-k2',
  })
  const cardLambdaC = createKpiCard({
    label: 'Umbral SIS (λ_c)',
    value: '0.14',
    description: 'λ_c = ⟨k⟩ / ⟨k²⟩',
    id: 'kpi-lambda-c',
  })
  const cardR0Net = createKpiCard({
    label: 'R₀ en red',
    value: '3.6',
    description: 'Número reproductivo efectivo ajustado a la topología',
    id: 'kpi-r0-net',
  })

  if (kpisSlot) {
    kpisSlot.appendChild(cardMeanK.el)
    kpisSlot.appendChild(cardK2.el)
    kpisSlot.appendChild(cardLambdaC.el)
    kpisSlot.appendChild(cardR0Net.el)
  }

  // Componentes interactivos
  const networkCanvas = createNetworkCanvas()
  const comparisonChart = createNetworkComparisonChart()

  if (canvasSlot) canvasSlot.appendChild(networkCanvas.el)
  if (comparisonSlot) comparisonSlot.appendChild(comparisonChart.el)

  // Estado del panel lateral
  let currentTopology: 'er' | 'ws' | 'ba' = 'ba'
  let currentN = 100
  let currentP = 0.05
  let currentK = 4
  let currentM = 3
  const currentBeta = 0.6
  const currentGamma = 0.2
  const currentI0 = 2
  const currentMRuns = 20
  let currentSeed = 42

  let activeGraph: Graph | null = null

  // Construir panel lateral
  const sidebar = document.createElement('div')
  sidebar.className = 'card network-controls'
  sidebar.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-4);'

  sidebar.innerHTML = `
    <h2 style="font-size: var(--step-1);">Topología</h2>
  `

  // Selector de topología
  const segTop = createSegmentedControl({
    options: [
      { label: 'Barabási (BA)', value: 'ba' },
      { label: 'Erdős (ER)', value: 'er' },
      { label: 'Watts (WS)', value: 'ws' },
    ],
    selected: 'ba',
    onChange: (val) => {
      currentTopology = val as 'er' | 'ws' | 'ba'
      updateDynamicParamVisibility()
      void regenerateGraph()
    },
    ariaLabel: 'Tipo de grafo',
  })
  sidebar.appendChild(segTop)

  // Slider N
  const sliderN = createSliderField({
    label: 'N — Nodos totales',
    min: 30,
    max: 1000,
    step: 10,
    value: currentN,
    unit: 'nodos',
    description: 'Cantidad de computadoras/dispositivos en la red modelada.',
    onChange: (nVal) => {
      currentN = nVal
    },
  })
  sidebar.appendChild(sliderN)

  // Contenedor dinámico de parámetros de topología
  const dynamicParamBox = document.createElement('div')
  dynamicParamBox.className = 'stack'
  sidebar.appendChild(dynamicParamBox)

  function updateDynamicParamVisibility(): void {
    dynamicParamBox.innerHTML = ''

    if (currentTopology === 'ba') {
      const sliderM = createSliderField({
        label: 'm — Enlaces por nuevo nodo',
        min: 1,
        max: 8,
        step: 1,
        value: currentM,
        description: 'Grado mínimo y conectividad de entrada en Barabási-Albert.',
        onChange: (mVal) => {
          currentM = mVal
        },
      })
      dynamicParamBox.appendChild(sliderM)
    } else if (currentTopology === 'er') {
      const sliderP = createSliderField({
        label: 'p — Probabilidad de enlace',
        min: 0.01,
        max: 0.2,
        step: 0.005,
        value: currentP,
        description: 'Probabilidad independiente de conexión entre cada par de nodos.',
        onChange: (pVal) => {
          currentP = pVal
        },
      })
      dynamicParamBox.appendChild(sliderP)
    } else {
      const sliderK = createSliderField({
        label: 'k — Grado regular inicial',
        min: 2,
        max: 12,
        step: 2,
        value: currentK,
        description: 'Número de vecinos iniciales en el anillo antes de reconectar.',
        onChange: (kVal) => {
          currentK = kVal
        },
      })
      const sliderRewire = createSliderField({
        label: 'p — Reconexión (Rewiring)',
        min: 0,
        max: 1.0,
        step: 0.05,
        value: currentP,
        description: 'Probabilidad de reconexión aleatoria hacia atajos de mundo pequeño.',
        onChange: (pVal) => {
          currentP = pVal
        },
      })
      dynamicParamBox.appendChild(sliderK)
      dynamicParamBox.appendChild(sliderRewire)
    }
  }

  updateDynamicParamVisibility()

  // Botón regenerar red
  const btnRegen = document.createElement('button')
  btnRegen.className = 'btn'
  btnRegen.style.cssText = 'width: 100%; margin-top: var(--space-2);'
  btnRegen.textContent = '🔄 Regenerar red'
  btnRegen.addEventListener('click', () => {
    currentSeed = Math.floor(Math.random() * 100000)
    void regenerateGraph()
  })
  sidebar.appendChild(btnRegen)

  // Botón correr lote Monte Carlo
  const btnBatch = document.createElement('button')
  btnBatch.className = 'btn btn--ghost'
  btnBatch.style.cssText = 'width: 100%; margin-top: var(--space-2);'
  btnBatch.textContent = '📊 Comparar con EDO (20 corridas)'
  btnBatch.addEventListener('click', () => {
    void runComparisonBatch()
  })
  sidebar.appendChild(btnBatch)

  if (sidebarSlot) {
    sidebarSlot.appendChild(sidebar)
  }

  function updateKpis(metrics: NetworkMetrics): void {
    cardMeanK.update(metrics.meanDegree.toFixed(2))
    cardK2.update(metrics.secondMoment.toFixed(1))
    cardLambdaC.update(metrics.lambdaC.toFixed(3))
    cardR0Net.update(metrics.r0Effective.toFixed(2))
  }

  async function regenerateGraph(): Promise<void> {
    btnRegen.disabled = true
    btnRegen.textContent = 'Generando...'

    try {
      const params =
        currentTopology === 'ba'
          ? { n: currentN, m: currentM, seed: currentSeed }
          : currentTopology === 'er'
            ? { n: currentN, p: currentP, seed: currentSeed }
            : { n: currentN, k: currentK, p: currentP, seed: currentSeed }

      const { graph, metrics } = await generateGraphAsync(
        currentTopology,
        params,
        currentBeta,
        currentGamma
      )

      activeGraph = graph
      updateKpis(metrics)

      networkCanvas.loadGraph(graph, currentBeta, currentGamma, 0, currentI0, currentSeed)
    } finally {
      btnRegen.disabled = false
      btnRegen.textContent = '🔄 Regenerar red'
    }
  }

  async function runComparisonBatch(): Promise<void> {
    if (!activeGraph) return
    btnBatch.disabled = true
    btnBatch.textContent = 'Simulando Monte Carlo...'

    try {
      const res = await runBatchAsync(
        {
          graph: activeGraph,
          beta: currentBeta,
          gamma: currentGamma,
          i0: currentI0,
          tMax: 50,
          dt: 0.2,
          mRuns: currentMRuns,
          baseSeed: currentSeed,
        },
        (completed, total) => {
          comparisonChart.setProgress(completed, total)
        }
      )

      comparisonChart.update(res, currentMRuns)
    } finally {
      btnBatch.disabled = false
      btnBatch.textContent = '📊 Comparar con EDO (20 corridas)'
    }
  }

  // Generar primer grafo inicial
  void regenerateGraph()

  // Limpieza al salir de la página
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === page || node.contains(page)) {
          networkCanvas.destroy()
          comparisonChart.destroy()
          observer.disconnect()
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })

  return page
}
