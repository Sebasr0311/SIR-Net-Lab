import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accesibilidad (a11y)', () => {
  test('la página de inicio no presenta violaciones críticas ni serias', async ({ page }) => {
    await page.goto('./#/')
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalOrSerious = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalOrSerious).toEqual([])
  })

  test('el catálogo /ui-kit no presenta violaciones críticas ni serias', async ({ page }) => {
    await page.goto('./#/ui-kit')
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const criticalOrSerious = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalOrSerious).toEqual([])
  })
})
