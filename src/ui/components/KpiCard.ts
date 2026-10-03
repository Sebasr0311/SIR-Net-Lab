/**
 * @fileoverview Componente KpiCard — tarjeta de indicador clave de rendimiento
 * con actualización dinámica anunciada a lectores de pantalla. (SIR-Net Lab)
 */

/** Opciones de configuración de la KpiCard. */
export interface KpiCardOpts {
  /** Etiqueta del indicador. */
  label: string
  /** Valor inicial a mostrar. */
  value: string
  /** Unidad opcional (p.ej. "días", "%"). */
  unit?: string
  /** Fórmula en KaTeX (se renderizará cuando se integre KaTeX en F3). */
  formula?: string
  /** Descripción extendida para tooltip/aria. */
  description?: string
  /** ID único del componente para aria. */
  id: string
}

/** Resultado de la fábrica — incluye el elemento y función de actualización. */
export interface KpiCardResult {
  /** Elemento raíz del componente. */
  el: HTMLElement
  /**
   * Actualiza el valor mostrado. El cambio es anunciado automáticamente
   * por lectores de pantalla gracias a `aria-live="polite"`.
   */
  update: (v: string) => void
}

/**
 * Crea una KpiCard con valor actualizable en vivo.
 * @param opts - Opciones de configuración.
 * @returns Objeto con el elemento y función `update`.
 */
export function createKpiCard(opts: KpiCardOpts): KpiCardResult {
  const el = document.createElement('div')
  el.className = 'kpi-card card'
  el.setAttribute('data-component', 'kpi-card')
  el.id = opts.id

  // Descripción accesible del indicador
  if (opts.description) {
    el.setAttribute('title', opts.description)
  }

  const labelEl = document.createElement('p')
  labelEl.className = 'kpi-card__label'
  labelEl.textContent = opts.label

  // Contenedor del valor con aria-live para anunciar cambios
  const valueWrap = document.createElement('p')
  valueWrap.className = 'kpi-card__value'
  valueWrap.setAttribute('aria-live', 'polite')
  valueWrap.setAttribute('aria-atomic', 'true')
  valueWrap.setAttribute(
    'aria-label',
    `${opts.label}: ${opts.value}${opts.unit ? ' ' + opts.unit : ''}`
  )

  const valueSpan = document.createElement('span')
  valueSpan.textContent = opts.value

  valueWrap.appendChild(valueSpan)

  if (opts.unit) {
    const unitSpan = document.createElement('span')
    unitSpan.className = 'kpi-card__unit'
    unitSpan.setAttribute('aria-hidden', 'true')
    unitSpan.textContent = ` ${opts.unit}`
    valueWrap.appendChild(unitSpan)
  }

  // Espacio para fórmula KaTeX (se llenará en F3)
  if (opts.formula) {
    const formulaEl = document.createElement('div')
    formulaEl.className = 'kpi-card__formula'
    formulaEl.dataset['katex'] = opts.formula
    formulaEl.setAttribute('aria-hidden', 'true')
    el.appendChild(formulaEl)
  }

  el.appendChild(labelEl)
  el.appendChild(valueWrap)

  /** Función de actualización. */
  function update(v: string): void {
    valueSpan.textContent = v
    valueWrap.setAttribute('aria-label', `${opts.label}: ${v}${opts.unit ? ' ' + opts.unit : ''}`)
  }

  return { el, update }
}
