import { describe, it, expect } from 'vitest'
import { SCENARIOS } from '../../../src/state/scenarios.ts'

describe('Escenarios predefinidos (docs/02 §2.8)', () => {
  it('contiene los 4 escenarios obligatorios', () => {
    expect(SCENARIOS['gusano-red-local']).toBeDefined()
    expect(SCENARIOS['ransomware-latencia']).toBeDefined()
    expect(SCENARIOS['brote-contenido']).toBeDefined()
    expect(SCENARIOS['desinformacion-red']).toBeDefined()
  })

  it('el escenario gusano-red-local tiene R₀ = 3 y N = 1000', () => {
    const s = SCENARIOS['gusano-red-local'].state
    expect(s.params.N).toBe(1000)
    expect(s.params.beta).toBe(0.6)
    expect(s.params.gamma).toBe(0.2)
    expect(s.params.beta / s.params.gamma).toBeCloseTo(3.0)
    expect(s.model).toBe('sir')
  })

  it('el escenario brote-contenido tiene R₀ = 0.75 < 1', () => {
    const s = SCENARIOS['brote-contenido'].state
    expect(s.params.beta).toBe(0.15)
    expect(s.params.gamma).toBe(0.2)
    expect(s.params.beta / s.params.gamma).toBeCloseTo(0.75)
  })

  it('el escenario ransomware-latencia define período de latencia', () => {
    const s = SCENARIOS['ransomware-latencia'].state
    expect(s.model).toBe('seir')
    expect(s.params.sigma).toBe(0.5)
    expect(s.params.N).toBe(5000)
  })

  it('el escenario desinformacion-red modela gran población', () => {
    const s = SCENARIOS['desinformacion-red'].state
    expect(s.params.N).toBe(10000)
    expect(s.params.beta / s.params.gamma).toBeCloseTo(5.0)
  })
})
