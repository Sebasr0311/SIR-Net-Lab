/**
 * @fileoverview Router mínimo basado en hashchange (SIR-Net Lab).
 *
 * Escucha cambios en `location.hash`, resuelve la ruta registrada
 * y renderiza el elemento resultante en el contenedor `#main`.
 */

/** Definición de una ruta registrada. */
interface Route {
  /** Fragmento de hash sin el '#', p.ej. "/" o "/simulator". */
  path: string
  /** Función que construye y retorna el elemento HTML de la página. */
  render: () => HTMLElement
}

/**
 * Router de hash mínimo para SIR-Net Lab.
 * No depende de ninguna librería externa.
 */
export class Router {
  private routes: Route[] = []
  private container: HTMLElement | null = null

  /**
   * Registra una ruta con su función de renderizado.
   * @param path - Ruta sin '#', p.ej. "/" o "/simulator".
   * @param render - Función que retorna el HTMLElement de la página.
   */
  register(path: string, render: () => HTMLElement): void {
    this.routes.push({ path, render })
  }

  /**
   * Navega programáticamente a una ruta.
   * @param path - Ruta sin '#'.
   */
  navigate(path: string): void {
    window.location.hash = path
  }

  /**
   * Resuelve la ruta activa y renderiza en el contenedor.
   */
  private resolve(): void {
    const raw = window.location.hash.slice(1) // quitar '#'
    const qIdx = raw.indexOf('?')
    const cleanPath = qIdx >= 0 ? raw.slice(0, qIdx) : raw
    const path = cleanPath === '' ? '/' : cleanPath

    const route = this.routes.find((r) => r.path === path)

    if (!this.container) {
      this.container = document.getElementById('main')
    }

    if (!this.container) return

    // Limpiar contenido anterior
    this.container.innerHTML = ''

    if (route) {
      this.container.appendChild(route.render())
    } else {
      this.container.appendChild(this.renderNotFound(path))
    }

    // Mover el foco al contenedor principal para accesibilidad
    this.container.focus()
  }

  /** Página de error 404 para rutas no registradas. */
  private renderNotFound(path: string): HTMLElement {
    const section = document.createElement('section')
    section.innerHTML = `
      <h1>404 — Página no encontrada</h1>
      <p>La ruta <code>${path}</code> no existe.</p>
      <a href="#/">Volver al inicio</a>
    `
    return section
  }

  /**
   * Inicia el router: escucha hashchange y resuelve la ruta inicial.
   */
  start(): void {
    window.addEventListener('hashchange', () => {
      this.resolve()
    })
    // Resolver la ruta actual al iniciar
    this.resolve()
  }
}
