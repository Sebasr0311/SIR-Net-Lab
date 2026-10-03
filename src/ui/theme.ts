/**
 * @fileoverview Gestión del tema claro/oscuro (SIR-Net Lab).
 *
 * Lee la preferencia del sistema con `prefers-color-scheme`,
 * persiste la elección del usuario en `localStorage('theme')`,
 * y aplica el tema estableciendo `document.documentElement.dataset.theme`.
 */

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/**
 * Lee el tema guardado en localStorage; null si no hay preferencia guardada.
 */
function getSavedTheme(): Theme | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return null
}

/**
 * Aplica el tema al documento mediante el atributo data-theme.
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset['theme'] = 'dark'
  } else {
    delete document.documentElement.dataset['theme']
  }
}

/**
 * Inicializa el sistema de temas:
 * 1. Lee localStorage; si no hay preferencia guardada, usa el tema claro por defecto.
 * 2. Aplica el tema inmediatamente para evitar destellos (FOUC).
 */
export function initTheme(): void {
  const saved = getSavedTheme()
  const theme = saved ?? 'light'
  applyTheme(theme)
}

/**
 * Alterna entre temas claro y oscuro y persiste la elección.
 * Retorna el nuevo tema aplicado.
 */
export function toggleTheme(): Theme {
  const current = document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light'
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  localStorage.setItem(STORAGE_KEY, next)
  return next
}

/**
 * Retorna el tema actualmente activo.
 */
export function getActiveTheme(): Theme {
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light'
}
