/**
 * @fileoverview Lienzo interactivo de simulación en red (d3-force + Canvas 2D).
 * Renderizado de alto rendimiento (>= 30 FPS con hasta 2000 nodos) con barra de transporte,
 * velocidad ajustable, semilla reproducible y contadores en vivo.
 * (SIR-Net Lab — docs/02 §2.3, T4.3 & T4.4)
 */

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import type { Graph } from '../../sim/graphs/types.ts'
import { simulateGillespie, NODE_STATE, type GillespieResult } from '../../sim/gillespie.ts'

interface SimNode extends SimulationNodeDatum {
  id: number
  state: number // 0: S, 1: E, 2: I, 3: R
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: number | SimNode
  target: number | SimNode
}

export interface NetworkCanvasHandle {
  el: HTMLElement
  loadGraph: (
    graph: Graph,
    beta: number,
    gamma: number,
    sigma?: number,
    i0?: number,
    seed?: number
  ) => void
  destroy: () => void
}

export function createNetworkCanvas(): NetworkCanvasHandle {
  const container = document.createElement('div')
  container.className = 'card network-canvas-card'
  container.setAttribute('data-component', 'network-canvas')

  // Barra de transporte superior
  const header = document.createElement('div')
  header.className = 'network-canvas-header'
  header.innerHTML = `
    <div>
      <h2>Visualización dinámica del grafo</h2>
      <p class="text-muted">Propagación estocástica nodo a nodo (Gillespie)</p>
    </div>
    <div class="network-counters" style="display: flex; gap: var(--space-3); font-family: var(--font-mono); font-size: var(--step--1); font-weight: bold; color: var(--ink);">
      <span><span style="color: var(--S);" aria-hidden="true">●</span> S: <span id="cnt-s">0</span></span>
      <span style="display: none;" id="wrap-cnt-e"><span style="color: var(--E);" aria-hidden="true">●</span> E: <span id="cnt-e">0</span></span>
      <span><span style="color: #b3261e;" aria-hidden="true">●</span> I: <span id="cnt-i">0</span></span>
      <span><span style="color: #1b5e20;" aria-hidden="true">●</span> R: <span id="cnt-r">0</span></span>
      <span style="color: var(--ink-2);">t: <span id="cnt-t">0.0</span>d</span>
    </div>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'network-canvas-wrap'
  canvasWrap.style.cssText =
    'position: relative; width: 100%; height: 420px; background: var(--bg); border: 1px solid var(--line); border-radius: 6px; overflow: hidden;'

  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Lienzo animado de la red de nodos interconectados con propagación de infección'
  )
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;'
  canvasWrap.appendChild(canvas)

  // Barra de transporte inferior
  const transport = document.createElement('div')
  transport.className = 'network-transport-bar'
  transport.style.cssText =
    'display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-3);'
  transport.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--space-2);">
      <button class="btn btn--ghost btn-reset" type="button" aria-label="Rebobinar simulación al inicio">⏮</button>
      <button class="btn btn-play" type="button" aria-label="Iniciar o pausar simulación">▶ Reproducir</button>
      <button class="btn btn--ghost btn-step" type="button" aria-label="Avanzar un paso">⏭</button>
      
      <label style="font-size: var(--step--1); margin-left: var(--space-2);">
        Velocidad:
        <select class="select-speed" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--line); background: var(--surface); color: var(--ink);">
          <option value="0.5">0.5×</option>
          <option value="1" selected>1×</option>
          <option value="2">2×</option>
          <option value="5">5×</option>
        </select>
      </label>
    </div>

    <div style="display: flex; align-items: center; gap: var(--space-2);">
      <label style="font-size: var(--step--1); display: flex; align-items: center; gap: 4px;">
        🎲 Semilla:
        <input type="number" class="input-seed" value="42" style="width: 72px; padding: 4px 6px; font-family: var(--font-mono); border-radius: 4px; border: 1px solid var(--line); background: var(--surface); color: var(--ink);" />
      </label>
      <button class="btn btn--ghost btn-new-seed" type="button" style="font-size: var(--step--1);">Nueva</button>
    </div>
  `

  container.appendChild(header)
  container.appendChild(canvasWrap)
  container.appendChild(transport)

  // Selectores de UI
  const cntS = header.querySelector<HTMLElement>('#cnt-s')
  const cntE = header.querySelector<HTMLElement>('#cnt-e')
  const wrapE = header.querySelector<HTMLElement>('#wrap-cnt-e')
  const cntI = header.querySelector<HTMLElement>('#cnt-i')
  const cntR = header.querySelector<HTMLElement>('#cnt-r')
  const cntT = header.querySelector<HTMLElement>('#cnt-t')

  const btnReset = transport.querySelector<HTMLButtonElement>('.btn-reset')
  const btnPlay = transport.querySelector<HTMLButtonElement>('.btn-play')
  const btnStep = transport.querySelector<HTMLButtonElement>('.btn-step')
  const selectSpeed = transport.querySelector<HTMLSelectElement>('.select-speed')
  const inputSeed = transport.querySelector<HTMLInputElement>('.input-seed')
  const btnNewSeed = transport.querySelector<HTMLButtonElement>('.btn-new-seed')

  // Estado interno de la simulación
  const ctx = canvas.getContext('2d')
  let simulation: Simulation<SimNode, SimLink> | null = null
  let nodes: SimNode[] = []
  let links: SimLink[] = []

  let gillespieResult: GillespieResult | null = null
  let currentFrameIdx = 0
  let isPlaying = false
  let speedMultiplier = 1
  let animId: number | null = null
  let lastTickTime = 0

  let currentGraph: Graph | null = null
  let currentBeta = 0.6
  let currentGamma = 0.2
  let currentSigma = 0
  let currentI0 = 1
  let currentSeed = 42

  function resizeCanvas(): void {
    const rect = canvasWrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    if (simulation) {
      simulation.force('center', forceCenter(rect.width / 2, rect.height / 2))
      simulation.alpha(0.3).restart()
    }
    renderFrame()
  }

  window.addEventListener('resize', resizeCanvas)

  function renderFrame(): void {
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    // 1. Dibujar aristas (solo si n <= 500 para mantener 60 FPS o muestrear si n grande)
    if (nodes.length <= 600) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.07)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      for (let i = 0; i < links.length; i++) {
        const link = links[i]
        const src = link?.source as SimNode
        const tgt = link?.target as SimNode
        if (
          src?.x !== undefined &&
          src.y !== undefined &&
          tgt?.x !== undefined &&
          tgt.y !== undefined
        ) {
          ctx.moveTo(src.x, src.y)
          ctx.lineTo(tgt.x, tgt.y)
        }
      }
      ctx.stroke()
    }

    // 2. Dibujar nodos
    const nodeRadius = nodes.length > 500 ? 2 : nodes.length > 200 ? 3.5 : 5
    const colors = ['#0072B2', '#E69F00', '#D55E00', '#009E73'] // S, E, I, R

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node || node.x === undefined || node.y === undefined) continue

      ctx.fillStyle = colors[node.state] ?? '#0072B2'
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  function updateCounters(time: number, s: number, e: number, i: number, r: number): void {
    if (cntT) cntT.textContent = time.toFixed(1)
    if (cntS) cntS.textContent = Math.round(s).toString()
    if (cntE) cntE.textContent = Math.round(e).toString()
    if (cntI) cntI.textContent = Math.round(i).toString()
    if (cntR) cntR.textContent = Math.round(r).toString()
  }

  function applyHistoryFrame(frameIndex: number): void {
    if (!gillespieResult?.history || frameIndex >= gillespieResult.history.length) return
    const frame = gillespieResult.history[frameIndex]
    if (!frame) return

    let s = 0
    let e = 0
    let i = 0
    let r = 0

    for (let idx = 0; idx < nodes.length; idx++) {
      const st = frame.states[idx] ?? NODE_STATE.SUSCEPTIBLE
      const targetNode = nodes[idx]
      if (targetNode) {
        targetNode.state = st
      }
      if (st === NODE_STATE.SUSCEPTIBLE) s++
      else if (st === NODE_STATE.EXPOSED) e++
      else if (st === NODE_STATE.INFECTIOUS) i++
      else if (st === NODE_STATE.RECOVERED) r++
    }

    updateCounters(frame.t, s, e, i, r)
    renderFrame()
  }

  function loop(timestamp: number): void {
    if (!isPlaying) return

    if (!lastTickTime) lastTickTime = timestamp
    const elapsed = timestamp - lastTickTime

    const interval = 120 / speedMultiplier // ms entre frames
    if (elapsed >= interval) {
      lastTickTime = timestamp
      if (gillespieResult?.history && currentFrameIdx < gillespieResult.history.length - 1) {
        currentFrameIdx++
        applyHistoryFrame(currentFrameIdx)
      } else {
        // Fin de la simulación
        isPlaying = false
        if (btnPlay) btnPlay.textContent = '▶ Reproducir'
      }
    }

    animId = requestAnimationFrame(loop)
  }

  function startPlayback(): void {
    if (!gillespieResult) return
    if (currentFrameIdx >= (gillespieResult.history?.length ?? 0) - 1) {
      currentFrameIdx = 0
    }
    isPlaying = true
    lastTickTime = 0
    if (btnPlay) btnPlay.textContent = '⏸ Pausar'
    animId = requestAnimationFrame(loop)
  }

  function pausePlayback(): void {
    isPlaying = false
    if (btnPlay) btnPlay.textContent = '▶ Reproducir'
    if (animId) {
      cancelAnimationFrame(animId)
      animId = null
    }
  }

  function resetPlayback(): void {
    pausePlayback()
    currentFrameIdx = 0
    applyHistoryFrame(0)
  }

  function stepPlayback(): void {
    pausePlayback()
    if (gillespieResult?.history && currentFrameIdx < gillespieResult.history.length - 1) {
      currentFrameIdx++
      applyHistoryFrame(currentFrameIdx)
    }
  }

  // Cableado de controles de transporte
  btnPlay?.addEventListener('click', () => {
    if (isPlaying) pausePlayback()
    else startPlayback()
  })

  btnReset?.addEventListener('click', resetPlayback)
  btnStep?.addEventListener('click', stepPlayback)

  selectSpeed?.addEventListener('change', () => {
    speedMultiplier = parseFloat(selectSpeed.value) || 1
  })

  inputSeed?.addEventListener('change', () => {
    const val = parseInt(inputSeed.value, 10)
    if (!isNaN(val)) {
      currentSeed = val
      recalculateSimulation()
    }
  })

  btnNewSeed?.addEventListener('click', () => {
    currentSeed = Math.floor(Math.random() * 100000)
    if (inputSeed) inputSeed.value = currentSeed.toString()
    recalculateSimulation()
  })

  function recalculateSimulation(): void {
    if (!currentGraph) return

    gillespieResult = simulateGillespie({
      graph: currentGraph,
      beta: currentBeta,
      gamma: currentGamma,
      sigma: currentSigma,
      i0: currentI0,
      tMax: 60,
      dt: 0.2,
      seed: currentSeed,
      recordHistory: true,
    })

    currentFrameIdx = 0
    applyHistoryFrame(0)
  }

  function loadGraph(
    graph: Graph,
    beta: number,
    gamma: number,
    sigma = 0,
    i0 = 1,
    seed = 42
  ): void {
    currentGraph = graph
    currentBeta = beta
    currentGamma = gamma
    currentSigma = sigma
    currentI0 = i0
    currentSeed = seed
    if (inputSeed) inputSeed.value = seed.toString()

    if (wrapE) {
      wrapE.style.display = sigma > 0 ? '' : 'none'
    }

    // Inicializar nodos y links para d3-force
    nodes = Array.from({ length: graph.n }, (_, id) => ({
      id,
      state: NODE_STATE.SUSCEPTIBLE,
    }))

    links = graph.edges.map(([source, target]) => ({
      source,
      target,
    }))

    if (simulation) {
      simulation.stop()
    }

    const rect = canvasWrap.getBoundingClientRect()
    const width = rect.width || 600
    const height = rect.height || 420

    // Configurar simulación de fuerzas
    simulation = forceSimulation<SimNode, SimLink>(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(nodes.length > 500 ? 10 : 25)
          .strength(0.3)
      )
      .force('charge', forceManyBody().strength(nodes.length > 500 ? -5 : -18))
      .force('center', forceCenter(width / 2, height / 2))
      .alphaDecay(0.04)

    simulation.on('tick', () => {
      renderFrame()
    })

    recalculateSimulation()
  }

  function destroy(): void {
    window.removeEventListener('resize', resizeCanvas)
    pausePlayback()
    if (simulation) simulation.stop()
  }

  requestAnimationFrame(() => {
    resizeCanvas()
  })

  return { el: container, loadGraph, destroy }
}
