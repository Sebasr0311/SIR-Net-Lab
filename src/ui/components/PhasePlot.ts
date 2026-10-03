/**
 * @fileoverview Retrato de fase S–I con campo de direcciones y trayectorias interactivas al clic.
 * Respeta la integral primera del modelo SIR: I + S - (N/R₀)*ln(S) = const.
 * (SIR-Net Lab — docs/02 §2.1 & RF-05)
 */

import { rk4 } from '../../core/solvers/rk4.ts'
import { sirRhs } from '../../core/models/sir.ts'
import type { Params } from '../../core/models/types.ts'

export interface PhasePlotHandle {
  el: HTMLElement
  update: (
    params: Params,
    currentTrajectory: { S: number[]; I: number[] },
    r0: number,
    peakS?: number,
    peakI?: number
  ) => void
  destroy: () => void
}

interface CustomTrajectory {
  points: Array<{ S: number; I: number }>
}

export function createPhasePlot(): PhasePlotHandle {
  const container = document.createElement('div')
  container.className = 'card phase-plot-card'
  container.setAttribute('data-component', 'phase-plot')

  const header = document.createElement('div')
  header.className = 'phase-plot-header'
  header.innerHTML = `
    <div>
      <h2>Retrato de fase (S – I)</h2>
      <p class="text-muted">Haz clic en el plano para trazar órbitas adicionales</p>
    </div>
    <div class="phase-plot-actions">
      <button class="btn btn--ghost btn-clear-trajectories" type="button">
        Limpiar órbitas
      </button>
    </div>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'phase-plot-canvas-wrap'
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 350px; cursor: crosshair;'

  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Retrato de fase en el plano Susceptibles vs Infectados con campo de direcciones y curvas de nivel'
  )
  canvas.style.cssText = 'width: 100%; height: 100%; display: block;'
  canvasWrap.appendChild(canvas)

  const coordsDisplay = document.createElement('div')
  coordsDisplay.className = 'phase-plot-coords'
  coordsDisplay.style.cssText =
    'font-family: var(--font-mono); font-size: var(--step--1); color: var(--ink-2); margin-top: var(--space-2);'
  coordsDisplay.textContent = 'Cursor: (S: —, I: —)'

  container.appendChild(header)
  container.appendChild(canvasWrap)
  container.appendChild(coordsDisplay)

  // Inyectar estilos
  const style = document.createElement('style')
  style.textContent = `
    .phase-plot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .phase-plot-header h2 {
      font-size: var(--step-1);
    }
  `
  container.appendChild(style)

  const ctx = canvas.getContext('2d')
  let currentParams: Params = { N: 1000, beta: 0.6, gamma: 0.2, i0: 1 }
  let currentTrajectory: { S: number[]; I: number[] } = { S: [], I: [] }
  let currentR0 = 3
  let currentPeakS = 333
  let currentPeakI = 500
  const customTrajectories: CustomTrajectory[] = []

  // Manejo de resize con devicePixelRatio
  function resizeCanvas(): void {
    const rect = canvasWrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    render()
  }

  window.addEventListener('resize', resizeCanvas)

  // Conversión de coordenadas modelo (S, I) -> Canvas (px)
  const padding = { top: 20, right: 30, bottom: 40, left: 60 }

  function toCanvasX(S: number, width: number): number {
    const plotWidth = width - padding.left - padding.right
    return padding.left + (S / currentParams.N) * plotWidth
  }

  function toCanvasY(I: number, height: number): number {
    const plotHeight = height - padding.top - padding.bottom
    return height - padding.bottom - (I / currentParams.N) * plotHeight
  }

  function toModelCoords(
    px: number,
    py: number,
    width: number,
    height: number
  ): { S: number; I: number } {
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom
    const S = Math.max(
      0,
      Math.min(currentParams.N, ((px - padding.left) / plotWidth) * currentParams.N)
    )
    const I = Math.max(
      0,
      Math.min(currentParams.N, ((height - padding.bottom - py) / plotHeight) * currentParams.N)
    )
    return { S, I }
  }

  function render(): void {
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const N = currentParams.N

    // 1. Ejes y cuadrícula
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1

    const numTicks = 5
    for (let i = 0; i <= numTicks; i++) {
      const val = (i / numTicks) * N
      const x = toCanvasX(val, width)
      const y = toCanvasY(val, height)

      // Línea vertical
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()

      // Línea horizontal
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Etiquetas de texto
      ctx.fillStyle = '#4A5560'
      ctx.font = '11px JetBrains Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(val).toString(), x, height - padding.bottom + 16)

      ctx.textAlign = 'right'
      ctx.fillText(Math.round(val).toString(), padding.left - 8, y + 4)
    }

    // Título de ejes
    ctx.fillStyle = '#1B1F24'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Susceptibles (S)', (width + padding.left) / 2, height - 8)

    ctx.save()
    ctx.translate(16, (height + padding.top) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Infectados (I)', 0, 0)
    ctx.restore()

    // 2. Campo de direcciones (grid de vectores normalizados)
    const rhs = sirRhs(currentParams)
    const gridCols = 16
    const gridRows = 12

    ctx.strokeStyle = 'rgba(31, 78, 121, 0.22)'
    ctx.lineWidth = 1.2

    for (let c = 1; c < gridCols; c++) {
      for (let r = 1; r < gridRows; r++) {
        const sVal = (c / gridCols) * N
        const iVal = (r / gridRows) * N
        if (sVal + iVal > N * 1.05) continue

        const stateVec = new Float64Array([sVal, iVal, 0])
        const d = rhs(0, stateVec)
        const dS = d[0] ?? 0
        const dI = d[1] ?? 0
        const mag = Math.hypot(dS, dI)

        if (mag > 1e-9) {
          const arrowLen = 10
          const uS = (dS / mag) * arrowLen
          const uI = (dI / mag) * arrowLen

          const cx = toCanvasX(sVal, width)
          const cy = toCanvasY(iVal, height)

          const dx = (uS / N) * (width - padding.left - padding.right)
          const dy = -(uI / N) * (height - padding.top - padding.bottom)

          ctx.beginPath()
          ctx.moveTo(cx - dx * 0.5, cy - dy * 0.5)
          ctx.lineTo(cx + dx * 0.5, cy + dy * 0.5)
          ctx.stroke()
        }
      }
    }

    // 3. Línea crítica S = N / R₀ (donde dI/dt = 0)
    if (currentR0 > 1) {
      const sCritX = toCanvasX(N / currentR0, width)
      ctx.strokeStyle = 'rgba(213, 94, 0, 0.4)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(sCritX, padding.top)
      ctx.lineTo(sCritX, height - padding.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#D55E00'
      ctx.font = '10px JetBrains Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(' S = N/R₀', sCritX, padding.top + 14)
    }

    // 4. Trayectorias adicionales agregadas por clic
    customTrajectories.forEach((traj) => {
      if (traj.points.length < 2) return
      ctx.strokeStyle = 'rgba(0, 158, 115, 0.8)' // Okabe-Ito Green
      ctx.lineWidth = 1.5
      ctx.beginPath()
      const first = traj.points[0]
      if (first) {
        ctx.moveTo(toCanvasX(first.S, width), toCanvasY(first.I, height))
        for (let i = 1; i < traj.points.length; i++) {
          const pt = traj.points[i]
          if (pt) {
            ctx.lineTo(toCanvasX(pt.S, width), toCanvasY(pt.I, height))
          }
        }
      }
      ctx.stroke()
    })

    // 5. Trayectoria principal activa de la simulación
    if (currentTrajectory.S.length > 1) {
      ctx.strokeStyle = '#1F4E79' // Accent dark blue
      ctx.lineWidth = 3
      ctx.beginPath()
      const firstS = currentTrajectory.S[0] ?? 0
      const firstI = currentTrajectory.I[0] ?? 0
      ctx.moveTo(toCanvasX(firstS, width), toCanvasY(firstI, height))

      for (let i = 1; i < currentTrajectory.S.length; i++) {
        const sVal = currentTrajectory.S[i] ?? 0
        const iVal = currentTrajectory.I[i] ?? 0
        ctx.lineTo(toCanvasX(sVal, width), toCanvasY(iVal, height))
      }
      ctx.stroke()

      // Punto inicial (S0, I0)
      ctx.fillStyle = '#0072B2'
      ctx.beginPath()
      ctx.arc(toCanvasX(firstS, width), toCanvasY(firstI, height), 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Marcador de pico teórico (S_pico, I_max)
      if (currentPeakS > 0 && currentPeakI > 0) {
        const px = toCanvasX(currentPeakS, width)
        const py = toCanvasY(currentPeakI, height)

        ctx.fillStyle = '#D55E00'
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // Interacción de clic: traza una nueva órbita
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    const { S, I } = toModelCoords(px, py, width, height)
    if (S <= 0 || I <= 0 || S + I > currentParams.N * 1.2) return

    // Integrar hacia adelante con RK4
    const rhs = sirRhs(currentParams)
    const y0 = new Float64Array([S, I, 0])
    const seriesFwd = rk4(rhs, y0, 0, 50, { dt: 0.1 })

    const points: Array<{ S: number; I: number }> = []
    for (let i = 0; i < seriesFwd.S.length; i++) {
      const sVal = seriesFwd.S[i]
      const iVal = seriesFwd.I[i]
      if (sVal !== undefined && iVal !== undefined) {
        points.push({ S: sVal, I: iVal })
      }
    }

    customTrajectories.push({ points })
    render()
  })

  // Mostrar coordenadas en hover
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    const { S, I } = toModelCoords(px, py, width, height)
    coordsDisplay.textContent = `Cursor: (S: ${Math.round(S)}, I: ${Math.round(I)})`
  })

  canvas.addEventListener('mouseleave', () => {
    coordsDisplay.textContent = 'Cursor: (S: —, I: —)'
  })

  // Botón limpiar
  const btnClear = header.querySelector<HTMLButtonElement>('.btn-clear-trajectories')
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      customTrajectories.length = 0
      render()
    })
  }

  function update(
    params: Params,
    trajectory: { S: number[]; I: number[] },
    r0: number,
    peakS = 0,
    peakI = 0
  ): void {
    currentParams = params
    currentTrajectory = trajectory
    currentR0 = r0
    currentPeakS = peakS
    currentPeakI = peakI

    // Forzar redibujado
    const rect = canvasWrap.getBoundingClientRect()
    if (rect.width > 0 && canvas.width === 0) {
      resizeCanvas()
    } else {
      render()
    }
  }

  function destroy(): void {
    window.removeEventListener('resize', resizeCanvas)
  }

  // Medir inicialmente al montar en DOM
  requestAnimationFrame(() => {
    resizeCanvas()
  })

  return { el: container, update, destroy }
}
