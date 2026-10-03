/**
 * @fileoverview Componente Accordion — secciones plegables accesibles.
 * Usa elementos nativos <details>/<summary> para accesibilidad automática.
 * (SIR-Net Lab)
 */

/** Sección de acordeón. */
export interface AccordionSection {
  /** Título visible del panel. */
  title: string
  /** Contenido HTML del panel. */
  content: HTMLElement
  /** Si el panel comienza abierto. Por defecto false. */
  open?: boolean
}

/**
 * Crea un acordeón con múltiples secciones plegables.
 * Utiliza `<details>`/`<summary>` nativos, que ofrecen accesibilidad de teclado
 * y semántica correcta sin JavaScript adicional.
 *
 * @param sections - Lista de secciones del acordeón.
 * @returns HTMLElement raíz del componente.
 */
export function createAccordion(sections: AccordionSection[]): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'accordion'
  wrapper.setAttribute('data-component', 'accordion')

  sections.forEach((section) => {
    const details = document.createElement('details')
    if (section.open) {
      details.open = true
    }

    const summary = document.createElement('summary')
    summary.textContent = section.title

    const body = document.createElement('div')
    body.className = 'accordion__body'
    body.appendChild(section.content)

    details.appendChild(summary)
    details.appendChild(body)
    wrapper.appendChild(details)
  })

  return wrapper
}
