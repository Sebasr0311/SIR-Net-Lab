/**
 * @fileoverview Componente SliderField — control de parámetro con slider,
 * campo numérico y botones ±. Completamente accesible. (SIR-Net Lab)
 */

/** Opciones de configuración del SliderField. */
export interface SliderFieldOpts {
  /** Etiqueta descriptiva del parámetro. */
  label: string
  /** Valor mínimo. */
  min: number
  /** Valor máximo. */
  max: number
  /** Paso de incremento. */
  step: number
  /** Valor inicial. */
  value: number
  /** Unidad opcional (p.ej. "días⁻¹"). */
  unit?: string
  /** Texto del tooltip de ayuda. */
  description?: string
  /** Callback invocado cuando cambia el valor. */
  onChange: (v: number) => void
}

/** Identificador único incremental para asociar labels con inputs. */
let sliderCount = 0

/**
 * Limita un número al rango [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Crea un SliderField: slider + campo numérico sincronizados + botones ±.
 * @param opts - Opciones de configuración.
 * @returns HTMLElement raíz del componente.
 */
export function createSliderField(opts: SliderFieldOpts): HTMLElement {
  const id = `slider-${++sliderCount}`
  const tooltipId = `${id}-tooltip`

  const container = document.createElement('div')
  container.className = 'slider-field'
  container.setAttribute('data-component', 'slider-field')

  // --- Fila de etiqueta ---
  const labelRow = document.createElement('div')
  labelRow.className = 'slider-field__label-row'

  const label = document.createElement('label')
  label.htmlFor = `${id}-number`
  label.textContent = opts.label
  if (opts.unit) {
    const unitSpan = document.createElement('span')
    unitSpan.style.cssText = 'font-weight:400; color: var(--ink-2); margin-left: 4px;'
    unitSpan.textContent = `(${opts.unit})`
    label.appendChild(unitSpan)
  }
  labelRow.appendChild(label)

  // Tooltip de ayuda
  if (opts.description) {
    const tooltipWrap = document.createElement('span')
    tooltipWrap.className = 'tooltip-wrap'
    tooltipWrap.setAttribute('role', 'group')

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'tooltip-wrap__trigger'
    trigger.textContent = 'ⓘ'
    trigger.setAttribute('aria-describedby', tooltipId)
    trigger.setAttribute('aria-label', `Ayuda: ${opts.label}`)

    const bubble = document.createElement('span')
    bubble.className = 'tooltip-wrap__bubble'
    bubble.id = tooltipId
    bubble.setAttribute('role', 'tooltip')
    bubble.textContent = opts.description

    tooltipWrap.appendChild(trigger)
    tooltipWrap.appendChild(bubble)
    labelRow.appendChild(tooltipWrap)
  }

  container.appendChild(labelRow)

  // --- Fila de controles ---
  const controlsRow = document.createElement('div')
  controlsRow.className = 'slider-field__controls'

  // Botón −
  const btnMinus = document.createElement('button')
  btnMinus.type = 'button'
  btnMinus.className = 'slider-field__step-btn'
  btnMinus.textContent = '−'
  btnMinus.setAttribute('aria-label', `Disminuir ${opts.label}`)
  btnMinus.setAttribute('tabindex', '0')

  // Slider
  const range = document.createElement('input')
  range.type = 'range'
  range.id = `${id}-range`
  range.className = 'slider-field__range'
  range.min = String(opts.min)
  range.max = String(opts.max)
  range.step = String(opts.step)
  range.value = String(opts.value)
  range.setAttribute('aria-label', opts.label)
  range.setAttribute('aria-valuemin', String(opts.min))
  range.setAttribute('aria-valuemax', String(opts.max))
  range.setAttribute('aria-valuenow', String(opts.value))

  // Campo numérico
  const number = document.createElement('input')
  number.type = 'number'
  number.id = `${id}-number`
  number.className = 'slider-field__number'
  number.min = String(opts.min)
  number.max = String(opts.max)
  number.step = String(opts.step)
  number.value = String(opts.value)
  number.setAttribute('aria-label', opts.label)

  // Botón +
  const btnPlus = document.createElement('button')
  btnPlus.type = 'button'
  btnPlus.className = 'slider-field__step-btn'
  btnPlus.textContent = '+'
  btnPlus.setAttribute('aria-label', `Aumentar ${opts.label}`)
  btnPlus.setAttribute('tabindex', '0')

  controlsRow.appendChild(btnMinus)
  controlsRow.appendChild(range)
  controlsRow.appendChild(number)
  controlsRow.appendChild(btnPlus)
  container.appendChild(controlsRow)

  // --- Estado interno ---
  let currentValue = clamp(opts.value, opts.min, opts.max)

  /** Aplica un nuevo valor a todos los controles y dispara onChange. */
  function applyValue(raw: number): void {
    const v = clamp(raw, opts.min, opts.max)
    const isValid = v >= opts.min && v <= opts.max
    currentValue = v

    range.value = String(v)
    number.value = String(v)
    range.setAttribute('aria-valuenow', String(v))
    number.setAttribute('aria-invalid', isValid ? 'false' : 'true')

    opts.onChange(v)
  }

  // Sincronizar slider → número
  range.addEventListener('input', () => {
    applyValue(Number(range.value))
  })

  // Sincronizar número → slider
  number.addEventListener('change', () => {
    const parsed = parseFloat(number.value)
    if (!isNaN(parsed)) {
      applyValue(parsed)
    } else {
      number.setAttribute('aria-invalid', 'true')
    }
  })

  // Botón −
  btnMinus.addEventListener('click', () => {
    applyValue(Math.round((currentValue - opts.step) * 1e10) / 1e10)
  })

  // Botón +
  btnPlus.addEventListener('click', () => {
    applyValue(Math.round((currentValue + opts.step) * 1e10) / 1e10)
  })

  return container
}
