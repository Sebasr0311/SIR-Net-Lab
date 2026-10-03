/**
 * @fileoverview Componente SegmentedControl — grupo de opciones mutuamente
 * excluyentes. Accesible mediante role="group" y aria-pressed. (SIR-Net Lab)
 */

/** Opción individual del control segmentado. */
interface SegmentedOption {
  /** Texto visible. */
  label: string
  /** Valor interno. */
  value: string
}

/** Opciones de configuración del SegmentedControl. */
export interface SegmentedOpts {
  /** Lista de opciones disponibles. */
  options: SegmentedOption[]
  /** Valor de la opción seleccionada inicialmente. */
  selected: string
  /** Callback invocado cuando cambia la selección. */
  onChange: (v: string) => void
  /** Descripción del grupo para lectores de pantalla. */
  ariaLabel: string
}

/**
 * Crea un control segmentado (grupo de botones mutuamente excluyentes).
 * @param opts - Opciones de configuración.
 * @returns HTMLElement raíz del componente.
 */
export function createSegmentedControl(opts: SegmentedOpts): HTMLElement {
  const group = document.createElement('div')
  group.className = 'segmented'
  group.setAttribute('role', 'group')
  group.setAttribute('aria-label', opts.ariaLabel)

  const buttons = opts.options.map((option) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'segmented__btn'
    btn.textContent = option.label
    btn.dataset['value'] = option.value
    btn.setAttribute('aria-pressed', option.value === opts.selected ? 'true' : 'false')

    btn.addEventListener('click', () => {
      // Actualizar todos los botones
      buttons.forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset['value'] === option.value ? 'true' : 'false')
      })
      opts.onChange(option.value)
    })

    return btn
  })

  buttons.forEach((btn) => group.appendChild(btn))

  return group
}
