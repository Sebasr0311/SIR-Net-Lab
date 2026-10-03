/**
 * @fileoverview Mapa de calor 2D para análisis de identificabilidad y superficie de costo (Canvas 2D).
 * Visualiza el paisaje de error cuadrático medio (RMSE) como función de (β, γ), evidenciando
 * la correlación paramétrica y el valle elíptico donde R₀ = β/γ es constante.
 *
 * @see docs/02-modelo-matematico.md §2.6
 * @see docs/06-plan-de-trabajo.md T6.3
 */

import type { CostSurfaceGrid } from '../../core/calibration/costSurface.ts'

export interface CostSurfaceHeatmapHandle {
  el: HTMLElement
  update: (surface: CostSurfaceGrid) => void
  destroy: () => void
}

export function createCostSurfaceHeatmap(): CostSurfaceHeatmapHandle {
  const container = document.createElement('div')
  container.className = 'card cost-surface-heatmap-card'
  container.setAttribute('data-component', 'cost-surface-heatmap')

  const toolbar = document.createElement('div')
  toolbar.className = 'time-chart-toolbar'
  toolbar.style.cssText =
    'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3);'
  toolbar.innerHTML = `
    <div>
      <h2 style="font-size: var(--step-1); margin: 0;">Paisaje de costo e Identificabilidad (β vs γ)</h2>
      <p class="text-muted" style="color: var(--ink-2); font-size: var(--step--1); margin: 0;">
        Valle de mínimos cuadrados RMSE(β, γ) — Revela compensación entre transmisión y recuperación
      </p>
    </div>
    <div style="display: flex; gap: var(--space-2); align-items: center;">
      <span class="hover-info" style="font-family: var(--font-mono); font-size: var(--step--1); color: var(--ink-2);">
        Posá el cursor para explorar coordenadas
      </span>
      <button class="btn btn--ghost btn-export-png" type="button" aria-label="Exportar mapa de calor de identificabilidad como imagen PNG">
        📷 Exportar PNG
      </button>
    </div>
  `

  const canvasWrap = document.createElement('div')
  canvasWrap.style.cssText = 'position: relative; width: 100%; height: 350px;'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Mapa de calor 2D mostrando la superficie de costo de calibración para beta y gamma'
  )
  canvasWrap.appendChild(canvas)

  container.appendChild(toolbar)
  container.appendChild(canvasWrap)

  const hoverInfo = toolbar.querySelector<HTMLSpanElement>('.hover-info')
  const btnExport = toolbar.querySelector<HTMLButtonElement>('.btn-export-png')

  let currentSurface: CostSurfaceGrid | null = null

  // Dimensiones internas de trazado
  const PADDING_LEFT = 50
  const PADDING_BOTTOM = 40
  const PADDING_TOP = 20
  const PADDING_RIGHT = 30

  function getColorForValue(val: number, min: number, max: number): string {
    const range = Math.max(1e-6, max - min)
    const norm = Math.min(1, Math.max(0, (val - min) / range))

    // Gradiente viridis-like / perceptualmente suave
    // 0.0 -> Azul marino (#1f4e79)
    // 0.3 -> Verde esmeralda (#009e73)
    // 0.7 -> Amarillo ocre (#e69f00)
    // 1.0 -> Rojo carmesí (#b3261e)
    let r: number
    let g: number
    let b: number

    if (norm < 0.33) {
      const t = norm / 0.33
      r = Math.round(31 + t * (0 - 31))
      g = Math.round(78 + t * (158 - 78))
      b = Math.round(121 + t * (115 - 121))
    } else if (norm < 0.66) {
      const t = (norm - 0.33) / 0.33
      r = Math.round(0 + t * (230 - 0))
      g = Math.round(158 + t * (159 - 158))
      b = Math.round(115 + t * (0 - 115))
    } else {
      const t = (norm - 0.66) / 0.34
      r = Math.round(230 + t * (179 - 230))
      g = Math.round(159 + t * (38 - 159))
      b = Math.round(0 + t * (30 - 0))
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  function render(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvasWrap.getBoundingClientRect()
    const width = rect.width || 600
    const height = 350

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.save()
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    if (!currentSurface || currentSurface.costMatrix.length === 0) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(
        'Esperando cálculo de calibración para generar superficie de costo...',
        width / 2,
        height / 2
      )
      ctx.restore()
      return
    }

    const { betaValues, gammaValues, costMatrix, minCost, maxCost, bestBeta, bestGamma } =
      currentSurface

    const plotW = width - PADDING_LEFT - PADDING_RIGHT
    const plotH = height - PADDING_TOP - PADDING_BOTTOM

    const numRows = betaValues.length
    const numCols = gammaValues.length
    const cellW = plotW / numRows
    const cellH = plotH / numCols

    // Dibujar celdas de calor
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const cost = costMatrix[r]?.[c] ?? maxCost
        ctx.fillStyle = getColorForValue(cost, minCost, maxCost)

        const x = PADDING_LEFT + r * cellW
        // Invertir Y para que gamma crezca hacia arriba
        const y = PADDING_TOP + (numCols - 1 - c) * cellH

        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5)
      }
    }

    // Dibujar ejes y borde
    ctx.strokeStyle = '#2a323b'
    ctx.lineWidth = 1
    ctx.strokeRect(PADDING_LEFT, PADDING_TOP, plotW, plotH)

    // Etiquetas y marcas del Eje X (Beta)
    ctx.fillStyle = '#1b1f24'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.textAlign = 'center'
    const xStep = Math.max(1, Math.floor(numRows / 5))
    for (let r = 0; r < numRows; r += xStep) {
      const b = betaValues[r] ?? 0
      const x = PADDING_LEFT + (r + 0.5) * cellW
      ctx.fillText(b.toFixed(2), x, height - PADDING_BOTTOM + 16)
    }
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.fillText('Tasa de transmisión β', PADDING_LEFT + plotW / 2, height - 8)

    // Etiquetas y marcas del Eje Y (Gamma)
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.textAlign = 'right'
    const yStep = Math.max(1, Math.floor(numCols / 5))
    for (let c = 0; c < numCols; c += yStep) {
      const g = gammaValues[c] ?? 0
      const y = PADDING_TOP + (numCols - 1 - c + 0.5) * cellH + 4
      ctx.fillText(g.toFixed(2), PADDING_LEFT - 8, y)
    }

    ctx.save()
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.translate(14, PADDING_TOP + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Tasa de recuperación γ', 0, 0)
    ctx.restore()

    // Dibujar marcador de óptimo global (bestBeta, bestGamma)
    const bMin = betaValues[0] ?? 0
    const bMax = betaValues[numRows - 1] ?? 1
    const gMin = gammaValues[0] ?? 0
    const gMax = gammaValues[numCols - 1] ?? 1

    const optX = PADDING_LEFT + ((bestBeta - bMin) / Math.max(1e-6, bMax - bMin)) * plotW
    const optY = PADDING_TOP + (1 - (bestGamma - gMin) / Math.max(1e-6, gMax - gMin)) * plotH

    // Anillo exterior blanco y centro dorado
    ctx.beginPath()
    ctx.arc(optX, optY, 6, 0, 2 * Math.PI)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(optX, optY, 3, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffcc00'
    ctx.fill()

    // Etiqueta del mínimo
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 11px JetBrains Mono, monospace'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 4
    ctx.fillText(`(β̂=${bestBeta.toFixed(2)}, γ̂=${bestGamma.toFixed(2)})`, optX + 8, optY - 6)
    ctx.shadowBlur = 0

    ctx.restore()
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!currentSurface || !hoverInfo) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const plotW = rect.width - PADDING_LEFT - PADDING_RIGHT
    const plotH = rect.height - PADDING_TOP - PADDING_BOTTOM

    if (
      mouseX < PADDING_LEFT ||
      mouseX > rect.width - PADDING_RIGHT ||
      mouseY < PADDING_TOP ||
      mouseY > rect.height - PADDING_BOTTOM
    ) {
      hoverInfo.textContent = 'Posá el cursor para explorar coordenadas'
      return
    }

    const { betaValues, gammaValues, costMatrix } = currentSurface
    const numRows = betaValues.length
    const numCols = gammaValues.length

    const relX = (mouseX - PADDING_LEFT) / plotW
    const relY = 1 - (mouseY - PADDING_TOP) / plotH

    const rIdx = Math.min(numRows - 1, Math.max(0, Math.floor(relX * numRows)))
    const cIdx = Math.min(numCols - 1, Math.max(0, Math.floor(relY * numCols)))

    const b = betaValues[rIdx] ?? 0
    const g = gammaValues[cIdx] ?? 0
    const cost = costMatrix[rIdx]?.[cIdx] ?? 0
    const r0 = g > 0 ? (b / g).toFixed(2) : '—'

    hoverInfo.textContent = `β = ${b.toFixed(3)} | γ = ${g.toFixed(3)} | R₀ = ${r0} | RMSE = ${cost.toFixed(2)}`
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseleave', () => {
    if (hoverInfo) hoverInfo.textContent = 'Posá el cursor para explorar coordenadas'
  })

  btnExport?.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.download = `paisaje-costo-sir-net-lab-${new Date().toISOString().slice(0, 10)}.png`
    a.href = url
    a.click()
  })

  const ro = new ResizeObserver(() => render())
  ro.observe(canvasWrap)

  function update(surface: CostSurfaceGrid): void {
    currentSurface = surface
    render()
  }

  return {
    el: container,
    update,
    destroy: () => {
      ro.disconnect()
      canvas.removeEventListener('mousemove', handleMouseMove)
    },
  }
}
