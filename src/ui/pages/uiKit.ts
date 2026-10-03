/**
 * @fileoverview Página /ui-kit — catálogo de componentes del sistema de diseño.
 * Muestra todos los componentes base con ejemplos interactivos. (SIR-Net Lab)
 */

import { createSliderField } from '../components/SliderField.ts'
import { createSegmentedControl } from '../components/SegmentedControl.ts'
import { createKpiCard } from '../components/KpiCard.ts'
import { createAccordion } from '../components/Accordion.ts'
import { createTooltip } from '../components/Tooltip.ts'

/**
 * Crea la página del catálogo de componentes UI.
 */
export function pageUiKit(): HTMLElement {
  const page = document.createElement('section')
  page.style.cssText = 'padding: var(--space-8) var(--space-6); max-width: 960px; margin: 0 auto;'

  const heading = document.createElement('h1')
  heading.textContent = 'UI Kit — Sistema de diseño'
  heading.style.cssText = 'font-size: var(--step-3); margin-bottom: var(--space-8);'
  page.appendChild(heading)

  // --- Sección helper ---
  function addSection(title: string, content: HTMLElement): void {
    const section = document.createElement('section')
    section.style.cssText = 'margin-bottom: var(--space-8);'

    const h2 = document.createElement('h2')
    h2.textContent = title
    h2.style.cssText =
      'font-size: var(--step-1); margin-bottom: var(--space-4); border-bottom: 1px solid var(--line); padding-bottom: var(--space-2);'

    section.appendChild(h2)
    section.appendChild(content)
    page.appendChild(section)
  }

  // ─── Paleta de colores ───────────────────────────────────────────
  const paletteEl = document.createElement('div')
  paletteEl.style.cssText = 'display: flex; flex-wrap: wrap; gap: var(--space-4);'

  const colorTokens: Array<{ name: string; token: string }> = [
    { name: 'S — Susceptibles', token: '--S' },
    { name: 'E — Expuestos', token: '--E' },
    { name: 'I — Infectados', token: '--I' },
    { name: 'R — Recuperados', token: '--R' },
    { name: 'V — Vacunados', token: '--V' },
    { name: 'OK', token: '--ok' },
    { name: 'Warn', token: '--warn' },
    { name: 'Danger', token: '--danger' },
    { name: 'Accent', token: '--accent' },
    { name: 'Ink', token: '--ink' },
    { name: 'Ink-2', token: '--ink-2' },
    { name: 'Line', token: '--line' },
    { name: 'Surface', token: '--surface' },
    { name: 'BG', token: '--bg' },
  ]

  colorTokens.forEach(({ name, token }) => {
    const chip = document.createElement('div')
    chip.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 6px;'
    chip.innerHTML = `
      <div style="width:64px; height:64px; border-radius:8px; background: var(${token}); border: 1px solid var(--line);" title="${token}"></div>
      <span style="font-size: var(--step--1); text-align: center; max-width: 72px;">${name}</span>
      <code style="font-size: 0.7rem; color: var(--ink-2);">${token}</code>
    `
    paletteEl.appendChild(chip)
  })
  addSection('Paleta de colores (tokens)', paletteEl)

  // ─── Tipografía ──────────────────────────────────────────────────
  const typoEl = document.createElement('div')
  typoEl.style.cssText = 'display: flex; flex-direction: column; gap: var(--space-4);'
  const steps = [
    { step: '--step-3', sample: 'Título H1', family: 'var(--font-text)' },
    { step: '--step-2', sample: 'Título H2', family: 'var(--font-text)' },
    { step: '--step-1', sample: 'Subtítulo', family: 'var(--font-ui)' },
    { step: '--step-0', sample: 'Cuerpo de texto normal', family: 'var(--font-ui)' },
    { step: '--step--1', sample: 'Texto pequeño / UI label', family: 'var(--font-ui)' },
    { step: '--step-0', sample: 'β = 0.6  γ = 0.2  R₀ = 3.0', family: 'var(--font-mono)' },
  ]
  steps.forEach(({ step, sample, family }) => {
    const row = document.createElement('div')
    row.style.cssText = 'display: flex; align-items: baseline; gap: var(--space-4);'
    row.innerHTML = `
      <code style="min-width:90px; font-size:0.75rem; color:var(--ink-2);">${step}</code>
      <span style="font-size: var(${step}); font-family: ${family};">${sample}</span>
    `
    typoEl.appendChild(row)
  })
  addSection('Escala tipográfica', typoEl)

  // ─── Badges R₀ ──────────────────────────────────────────────────
  const badgeEl = document.createElement('div')
  badgeEl.style.cssText =
    'display: flex; gap: var(--space-4); flex-wrap: wrap; align-items: center;'
  badgeEl.innerHTML = `
    <span class="badge-r0" data-level="ok">R₀ = 0.75 ✓ Controlado</span>
    <span class="badge-r0" data-level="warn">R₀ = 1.8 ⚠ Moderado</span>
    <span class="badge-r0" data-level="danger">R₀ = 3.2 ✕ Epidemia</span>
  `
  addSection('Badge R₀ (semáforo)', badgeEl)

  // ─── SliderFields ────────────────────────────────────────────────
  const sliderEl = document.createElement('div')
  sliderEl.className = 'stack'
  sliderEl.style.cssText = 'max-width: 480px;'

  const sliderBeta = createSliderField({
    label: 'β — Tasa de transmisión',
    min: 0,
    max: 2,
    step: 0.01,
    value: 0.6,
    unit: 'días⁻¹',
    description:
      'Número de contactos efectivos por unidad de tiempo. Controla la velocidad de propagación.',
    onChange: (v) => {
      betaKpi.update(v.toFixed(2))
    },
  })

  const sliderGamma = createSliderField({
    label: 'γ — Tasa de recuperación',
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.2,
    unit: 'días⁻¹',
    description: 'Fracción diaria de infectados que se recuperan. 1/γ = período infeccioso.',
    onChange: () => {},
  })

  const sliderN = createSliderField({
    label: 'N — Población total',
    min: 100,
    max: 100000,
    step: 100,
    value: 1000,
    unit: 'nodos',
    description: 'Tamaño total de la red (número de hosts).',
    onChange: () => {},
  })

  sliderEl.appendChild(sliderBeta)
  sliderEl.appendChild(sliderGamma)
  sliderEl.appendChild(sliderN)
  addSection('SliderField', sliderEl)

  // ─── KPI Cards ───────────────────────────────────────────────────
  const kpiEl = document.createElement('div')
  kpiEl.style.cssText = 'display: flex; flex-wrap: wrap; gap: var(--space-4);'

  const betaKpi = createKpiCard({
    label: 'β — Transmisión',
    value: '0.60',
    unit: 'días⁻¹',
    description: 'Tasa de transmisión',
    id: 'kpi-beta',
  })

  const r0Kpi = createKpiCard({
    label: 'R₀',
    value: '3.00',
    formula: 'R_0 = \\frac{\\beta}{\\gamma}',
    description: 'Número reproductivo básico',
    id: 'kpi-r0',
  })

  const peakKpi = createKpiCard({
    label: 'Pico de infección',
    value: '28',
    unit: 'días',
    description: 'Día en que se alcanza el máximo de infectados',
    id: 'kpi-peak',
  })

  kpiEl.appendChild(betaKpi.el)
  kpiEl.appendChild(r0Kpi.el)
  kpiEl.appendChild(peakKpi.el)
  addSection('KPI Cards', kpiEl)

  // ─── SegmentedControl ────────────────────────────────────────────
  const segEl = document.createElement('div')
  segEl.className = 'stack'

  const segModelo = createSegmentedControl({
    options: [
      { label: 'SIR', value: 'sir' },
      { label: 'SEIR', value: 'seir' },
      { label: 'SEIS', value: 'seis' },
    ],
    selected: 'sir',
    onChange: (v) => {
      segStatus.textContent = `Modelo seleccionado: ${v.toUpperCase()}`
    },
    ariaLabel: 'Modelo epidemiológico',
  })

  const segSolver = createSegmentedControl({
    options: [
      { label: 'Euler', value: 'euler' },
      { label: 'RK4', value: 'rk4' },
      { label: 'DOPRI5', value: 'dopri5' },
    ],
    selected: 'rk4',
    onChange: () => {},
    ariaLabel: 'Método numérico',
  })

  const segStatus = document.createElement('p')
  segStatus.style.cssText = 'font-size: var(--step--1); color: var(--ink-2);'
  segStatus.textContent = 'Modelo seleccionado: SIR'

  segEl.appendChild(segModelo)
  segEl.appendChild(segSolver)
  segEl.appendChild(segStatus)
  addSection('SegmentedControl', segEl)

  // ─── Tooltips ────────────────────────────────────────────────────
  const tooltipEl = document.createElement('div')
  tooltipEl.style.cssText =
    'display: flex; gap: var(--space-6); flex-wrap: wrap; align-items: center;'

  const infoBtn1 = document.createElement('button')
  infoBtn1.type = 'button'
  infoBtn1.className = 'btn btn--ghost'
  infoBtn1.textContent = 'Hover / foco aquí ⓘ'

  const wrap1 = createTooltip(infoBtn1, 'Este es un tooltip de ejemplo con información contextual.')

  const infoBtn2 = document.createElement('button')
  infoBtn2.type = 'button'
  infoBtn2.className = 'btn btn--ghost'
  infoBtn2.textContent = 'R₀ info ⓘ'

  const wrap2 = createTooltip(
    infoBtn2,
    'R₀ = β/γ. Si R₀ > 1, el brote crece; si R₀ < 1, se extingue.'
  )

  tooltipEl.appendChild(wrap1)
  tooltipEl.appendChild(wrap2)
  addSection('Tooltips', tooltipEl)

  // ─── Accordion ───────────────────────────────────────────────────
  const sec1Content = document.createElement('div')
  sec1Content.innerHTML = '<p>β = 0.6 · γ = 0.2 · N = 1000 · I₀ = 1</p>'

  const sec2Content = document.createElement('div')
  sec2Content.innerHTML = '<p>ER (Erdős–Rényi) · n = 1000 nodos · p = 0.01</p>'

  const sec3Content = document.createElement('div')
  sec3Content.innerHTML = '<p>Solucionador RK4 · dt = 0.1 días · tMax = 60 días</p>'

  const accordionEl = createAccordion([
    { title: 'Parámetros del modelo', content: sec1Content, open: true },
    { title: 'Configuración de red', content: sec2Content },
    { title: 'Opciones del solucionador', content: sec3Content },
  ])
  addSection('Accordion', accordionEl)

  // ─── Botones ────────────────────────────────────────────────────
  const btnEl = document.createElement('div')
  btnEl.style.cssText = 'display: flex; gap: var(--space-4); flex-wrap: wrap; align-items: center;'
  btnEl.innerHTML = `
    <button class="btn" type="button">Simular</button>
    <button class="btn btn--ghost" type="button">Restablecer</button>
    <button class="btn" type="button" disabled style="opacity:.5; cursor:not-allowed;">Deshabilitado</button>
  `
  addSection('Botones', btnEl)

  return page
}
