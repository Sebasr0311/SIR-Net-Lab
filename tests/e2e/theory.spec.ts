import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Teoría, Inicio y Acerca de (F8)', () => {
  test('la página de inicio muestra el hero, aviso ético y accesos a los módulos', async ({
    page,
  }) => {
    await page.goto('./#/')

    // 1. Hero y título
    await expect(page.locator('h1')).toHaveText('SIR-Net Lab')

    // 2. Banner ético de ciberseguridad
    await expect(page.locator('.warning-banner')).toBeVisible()
    await expect(page.locator('.warning-banner')).toContainText(
      'Aviso académico y de ciberseguridad'
    )

    // 3. Tarjetas de módulos
    const moduleCards = page.locator('.module-card')
    await expect(moduleCards.first()).toBeVisible()
    const count = await moduleCards.count()
    expect(count).toBeGreaterThanOrEqual(6)
  })

  test('la página de teoría contiene derivaciones analíticas y glosario interactivo con KaTeX', async ({
    page,
  }) => {
    await page.goto('./#/theory')

    // 1. Encabezado principal y navegación
    await expect(page.locator('h1')).toContainText('Fundamentos Matemáticos')
    await expect(page.locator('#sec-sir-base')).toBeVisible()
    await expect(page.locator('#sec-integral-primera')).toBeVisible()
    await expect(page.locator('#sec-r0-estabilidad')).toBeVisible()

    // 2. Fórmulas KaTeX renderizadas
    await expect(page.locator('.katex').first()).toBeVisible()

    // 3. Glosario interactivo: búsqueda de términos
    const searchInput = page.locator('#glossary-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('latencia')

    const glossaryCards = page.locator('#glossary-cards-container article')
    await expect(glossaryCards.first()).toContainText('latencia')
  })

  test('la página Acerca de muestra el contexto académico, stack y referencias bibliográficas', async ({
    page,
  }) => {
    await page.goto('./#/about')

    // 1. Título principal
    await expect(page.locator('h1')).toHaveText('Acerca de SIR-Net Lab')

    // 2. Contexto de Ecuaciones Diferenciales 2026-II
    await expect(page.locator('body')).toContainText('Ecuaciones Diferenciales (2026-II)')

    // 3. Referencias bibliográficas
    await expect(page.locator('ol li').first()).toContainText('Kermack')
    const refCount = await page.locator('ol li').count()
    expect(refCount).toBeGreaterThanOrEqual(10)
  })

  test('las páginas de Inicio, Teoría y Acerca de cumplen con accesibilidad WCAG 2.1 AA', async ({
    page,
  }) => {
    for (const route of ['/#/', '/#/theory', '/#/about']) {
      await page.goto(`.${route}`)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

      const severeViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )
      expect(severeViolations).toEqual([])
    }
  })
})
