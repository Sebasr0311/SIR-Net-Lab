/**
 * @fileoverview Barra de KPIs en vivo con semáforo dinámico de R₀,
 * cobertura crítica de parcheo, pico epidémico y tamaño final del brote.
 * (SIR-Net Lab — docs/03 §RF-04 & T3.3)
 */

import { createKpiCard } from './KpiCard.ts'

export interface KpiBarHandle {
  el: HTMLElement
  update: (data: {
    r0: number
    criticalCoverage: number
    peakI: number
    peakTime: number
    finalAttackRate: number
  }) => void
}

export function createKpiBar(): KpiBarHandle {
  const container = document.createElement('div')
  container.className = 'kpi-bar'
  container.setAttribute('data-component', 'kpi-bar')

  // Tarjeta R₀ con badge integrado
  const cardR0 = createKpiCard({
    label: 'R₀ — Número básico',
    value: '3.00',
    description: 'R₀ = β / γ. Tasa esperada de infecciones secundarias por nodo.',
    formula: 'R_0 = \\frac{\\beta}{\\gamma}',
    id: 'kpi-r0',
  })

  const badgeR0 = document.createElement('span')
  badgeR0.className = 'badge-r0'
  badgeR0.setAttribute('data-level', 'danger')
  badgeR0.textContent = 'Epidemia'
  cardR0.el.appendChild(badgeR0)

  // Cobertura crítica
  const cardPc = createKpiCard({
    label: 'Cobertura crítica (p_c)',
    value: '66.7',
    unit: '%',
    description:
      'Porcentaje mínimo de equipos a parchear/inmunizar para impedir el brote: p_c = 1 - 1/R₀.',
    formula: 'p_c = 1 - \\frac{1}{R_0}',
    id: 'kpi-pc',
  })

  // Pico de infectados
  const cardPeak = createKpiCard({
    label: 'Pico de infección (I_max)',
    value: '509',
    unit: 'nodos',
    description: 'Máximo número de equipos infectados simultáneamente y momento en que ocurre.',
    id: 'kpi-peak',
  })

  // Tamaño final del brote
  const cardAttack = createKpiCard({
    label: 'Ataque final (1 - S_∞/N)',
    value: '94.0',
    unit: '%',
    description: 'Porcentaje acumulado de la población que resulta infectada al cabo del brote.',
    id: 'kpi-final-size',
  })

  container.appendChild(cardR0.el)
  container.appendChild(cardPc.el)
  container.appendChild(cardPeak.el)
  container.appendChild(cardAttack.el)

  // Estilos de la barra KPI
  const style = document.createElement('style')
  style.textContent = `
    .kpi-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
  `
  container.appendChild(style)

  function update(data: {
    r0: number
    criticalCoverage: number
    peakI: number
    peakTime: number
    finalAttackRate: number
  }): void {
    const { r0, criticalCoverage, peakI, peakTime, finalAttackRate } = data

    // 1. R0 y semáforo
    cardR0.update(r0.toFixed(2))
    if (r0 < 1) {
      badgeR0.setAttribute('data-level', 'ok')
      badgeR0.textContent = '✓ Controlado'
    } else if (r0 <= 2) {
      badgeR0.setAttribute('data-level', 'warn')
      badgeR0.textContent = '⚠ Moderado'
    } else {
      badgeR0.setAttribute('data-level', 'danger')
      badgeR0.textContent = '✕ Epidemia'
    }

    // 2. Cobertura crítica
    const pcPct = (criticalCoverage * 100).toFixed(1)
    cardPc.update(r0 <= 1 ? '0.0' : pcPct)

    // 3. Pico de infectados
    const tFormatted = peakTime >= 0 ? `(día ${peakTime.toFixed(1)})` : ''
    cardPeak.update(`${Math.round(peakI)} ${tFormatted}`)

    // 4. Ataque final
    const finalPct = (finalAttackRate * 100).toFixed(1)
    cardAttack.update(finalPct)
  }

  return { el: container, update }
}
