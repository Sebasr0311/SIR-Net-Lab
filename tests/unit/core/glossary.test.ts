/**
 * @fileoverview Pruebas unitarias para el Glosario y renderizado KaTeX (T8.1, T8.2).
 */

import { describe, it, expect } from 'vitest'
import { GLOSSARY } from '../../../src/ui/glossary.ts'
import { renderMathBlock, renderMathInline } from '../../../src/ui/katexHelper.ts'

describe('Glosario técnico y fórmulas KaTeX (F8)', () => {
  it('contiene los términos esenciales exigidos por el modelo matemático', () => {
    const requiredIds = [
      'beta',
      'gamma',
      'sigma',
      'nu',
      'r0',
      'reff',
      'imax',
      'pc',
      'attack_rate',
      'tc',
    ]
    for (const id of requiredIds) {
      const found = GLOSSARY.find((e) => e.id === id)
      expect(found).toBeDefined()
      expect(found?.definition.length).toBeGreaterThan(15)
      expect(found?.unit).toBeDefined()
    }
  })

  it('no contiene identificadores duplicados y todas las categorías son válidas', () => {
    const seen = new Set<string>()
    const validCategories = new Set(['parametros', 'metricas', 'redes', 'metodos'])

    for (const item of GLOSSARY) {
      expect(seen.has(item.id)).toBe(false)
      seen.add(item.id)
      expect(validCategories.has(item.category)).toBe(true)
    }
  })

  it('renderiza fórmulas matemáticas TeX válidas en bloque e inline sin lanzar errores', () => {
    const blockHtml = renderMathBlock('\\frac{dS}{dt} = -\\frac{\\beta S I}{N}')
    expect(blockHtml).toContain('katex')
    expect(blockHtml).toContain('math')

    const inlineHtml = renderMathInline('R_0 = \\frac{\\beta}{\\gamma}')
    expect(inlineHtml).toContain('katex')

    // Verificar que todas las fórmulas del glosario se renderizan correctamente
    for (const item of GLOSSARY) {
      if (item.formula) {
        const rendered = renderMathBlock(item.formula)
        expect(rendered).toContain('katex')
        expect(rendered).not.toContain('math-fallback')
      }
    }
  })
})
