import { describe, it, expect } from 'vitest'
import { createRng } from '../../../src/core/rng.ts'

describe('createRng — PRNG sfc32', () => {
  it('misma semilla produce la misma secuencia de 1000 valores (igualdad exacta)', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    for (let i = 0; i < 1000; i++) {
      const v1 = rng1()
      const v2 = rng2()
      expect(v1).toBe(v2)
    }
  })

  it('semillas distintas producen secuencias distintas', () => {
    const rngA = createRng(1)
    const rngB = createRng(2)
    let allEqual = true
    for (let i = 0; i < 100; i++) {
      if (rngA() !== rngB()) {
        allEqual = false
        break
      }
    }
    expect(allEqual).toBe(false)
  })

  it('los valores están en [0, 1)', () => {
    const rng = createRng(999)
    for (let i = 0; i < 500; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('semilla 0 no produce secuencia constante en cero', () => {
    const rng = createRng(0)
    const vals = Array.from({ length: 20 }, () => rng())
    const allZero = vals.every((v) => v === 0)
    expect(allZero).toBe(false)
  })
})
