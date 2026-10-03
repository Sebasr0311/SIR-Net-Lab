/**
 * @fileoverview Páginas placeholder para todas las rutas del router (SIR-Net Lab).
 *
 * Cada función retorna un <section> con el <h1> identificador de la página.
 * Se irán reemplazando por las implementaciones reales en fases posteriores.
 */

/** Fábrica interna para páginas placeholder. */
function makePlaceholder(title: string, description: string): HTMLElement {
  const section = document.createElement('section')
  section.style.cssText = 'padding: var(--space-8); max-width: 900px; margin: 0 auto;'
  section.innerHTML = `
    <h1 style="font-size: var(--step-3); margin-bottom: var(--space-4);">${title}</h1>
    <p style="color: var(--ink-2);">${description}</p>
  `
  return section
}

/** Página de inicio — resumen del simulador. */
export function pageHome(): HTMLElement {
  return makePlaceholder(
    'SIR-Net Lab',
    'Simulador de propagación de malware en redes con ecuaciones diferenciales.'
  )
}

/** Página del simulador principal. */
export function pageSimulator(): HTMLElement {
  return makePlaceholder(
    'Simulador',
    'Configuración y ejecución del modelo SIR/SEIR/SEIS. [Próximamente]'
  )
}

/** Página de visualización de red. */
export function pageNetwork(): HTMLElement {
  return makePlaceholder('Red', 'Visualización de la topología de red (d3-force). [Próximamente]')
}

/** Página de control de intervenciones. */
export function pageControl(): HTMLElement {
  return makePlaceholder(
    'Control',
    'Panel de control de intervenciones epidemiológicas. [Próximamente]'
  )
}

/** Página de calibración de parámetros. */
export function pageCalibration(): HTMLElement {
  return makePlaceholder(
    'Calibración',
    'Ajuste de parámetros mediante datos observados. [Próximamente]'
  )
}

/** Página de análisis de sensibilidad. */
export function pageSensitivity(): HTMLElement {
  return makePlaceholder(
    'Sensibilidad',
    'Análisis de sensibilidad de parámetros (PRCC, FAST). [Próximamente]'
  )
}

/** Página de teoría matemática. */
export function pageTheory(): HTMLElement {
  return makePlaceholder(
    'Teoría',
    'Fundamentos matemáticos: ecuaciones, R₀, equilibrios. [Próximamente]'
  )
}

/** Página de reto / juego educativo. */
export function pageChallenge(): HTMLElement {
  return makePlaceholder(
    'Reto',
    'Modo reto: detén el brote antes de que se propague. [Próximamente]'
  )
}

/** Página acerca de / créditos. */
export function pageAbout(): HTMLElement {
  return makePlaceholder('Acerca de', 'Información sobre el proyecto, autores y licencia.')
}
