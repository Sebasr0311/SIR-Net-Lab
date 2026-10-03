/**
 * @fileoverview Serialización/deserialización del estado en el hash de la URL.
 * Usa base64(JSON) para mantener URLs compartibles. (SIR-Net Lab)
 */

import { store } from './store.ts'
import type { AppState } from './store.ts'

const URL_KEY = 'state'

/**
 * Serializa el estado de la app en el hash de la URL como base64(JSON).
 * Preserva cualquier hash de ruta existente (#/ruta?...) añadiendo
 * el parámetro `state=...` al fragmento.
 */
export function pushStateToUrl(state: AppState): void {
  try {
    const json = JSON.stringify(state)
    const encoded = btoa(json)

    // Leer ruta actual del hash (sin parámetros de estado)
    const rawHash = window.location.hash.slice(1)
    const qIdx = rawHash.indexOf('?')
    const routePath = qIdx >= 0 ? rawHash.slice(0, qIdx) : rawHash

    const params = new URLSearchParams()
    params.set(URL_KEY, encoded)

    // Actualizar hash sin disparar navegación adicional
    const newHash = `${routePath || '/'}?${params.toString()}`
    history.replaceState(null, '', `#${newHash}`)
  } catch {
    // Silenciar errores de serialización
  }
}

/**
 * Lee el estado codificado en el hash de la URL.
 * @returns Estado parcial o null si el hash no contiene estado válido.
 */
export function readStateFromUrl(): Partial<AppState> | null {
  try {
    const rawHash = window.location.hash.slice(1)
    const qIdx = rawHash.indexOf('?')
    if (qIdx < 0) return null

    const queryStr = rawHash.slice(qIdx + 1)
    const params = new URLSearchParams(queryStr)
    const encoded = params.get(URL_KEY)
    if (!encoded) return null

    const json = atob(encoded)
    const parsed: unknown = JSON.parse(json)

    // Validación mínima: debe ser un objeto plano
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }

    return parsed as Partial<AppState>
  } catch {
    return null
  }
}

/**
 * Inicializa la sincronización URL ↔ store:
 * 1. Lee el estado de la URL y lo aplica al store si es válido.
 * 2. Suscribe cambios del store para actualizar la URL.
 */
export function initUrlState(): void {
  // Restaurar estado desde URL al cargar
  const urlState = readStateFromUrl()
  if (urlState) {
    store.setState(urlState)
  }

  // Suscribir store → URL (sin crear loop con hashchange)
  store.subscribe((state) => {
    pushStateToUrl(state)
  })
}
