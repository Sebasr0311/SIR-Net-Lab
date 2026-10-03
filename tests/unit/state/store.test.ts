import { describe, it, expect, beforeEach } from 'vitest'
import { store, DEFAULT_STATE } from '../../../src/state/store.ts'

describe('Store reactivo', () => {
  beforeEach(() => {
    store.setState({ ...DEFAULT_STATE, params: { ...DEFAULT_STATE.params } })
  })

  it('obtiene el estado inicial por defecto', () => {
    const s = store.getState()
    expect(s.solver).toBe('rk4')
    expect(s.model).toBe('sir')
    expect(s.params.N).toBe(1000)
    expect(s.params.beta).toBe(0.6)
    expect(s.params.gamma).toBe(0.2)
  })

  it('actualiza el estado de forma inmutable y notifica suscriptores', () => {
    let notified = false
    let receivedN = 0

    const unsubscribe = store.subscribe((newState) => {
      notified = true
      receivedN = newState.params.N
    })

    store.setState({
      params: { ...store.getState().params, N: 5000 },
      model: 'seir',
    })

    expect(notified).toBe(true)
    expect(receivedN).toBe(5000)
    expect(store.getState().model).toBe('seir')

    unsubscribe()
  })

  it('permite cancelar la suscripción', () => {
    let callCount = 0
    const unsubscribe = store.subscribe(() => {
      callCount++
    })

    store.setState({ seed: 99 })
    expect(callCount).toBe(1)

    unsubscribe()
    store.setState({ seed: 100 })
    expect(callCount).toBe(1)
  })
})
