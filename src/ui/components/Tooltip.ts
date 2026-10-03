/**
 * @fileoverview Componente Tooltip — burbuja de información contextual accesible.
 * Aparece en hover y focus. (SIR-Net Lab)
 */

let tooltipCount = 0

/**
 * Envuelve un `trigger` existente con un tooltip accesible.
 *
 * El trigger recibe `aria-describedby` apuntando al id del tooltip.
 * La burbuja es visible en hover y focus-within del wrapper.
 *
 * @param trigger - Elemento HTML que activa el tooltip.
 * @param content - Texto del tooltip.
 * @returns Wrapper HTMLElement que contiene el trigger y la burbuja.
 */
export function createTooltip(trigger: HTMLElement, content: string): HTMLElement {
  const id = `tooltip-${++tooltipCount}`

  const wrap = document.createElement('span')
  wrap.className = 'tooltip-wrap'

  const bubble = document.createElement('span')
  bubble.className = 'tooltip-wrap__bubble'
  bubble.id = id
  bubble.setAttribute('role', 'tooltip')
  bubble.textContent = content

  // Asociar trigger con tooltip
  trigger.setAttribute('aria-describedby', id)

  wrap.appendChild(trigger)
  wrap.appendChild(bubble)

  return wrap
}
