import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Modo Reto (F5)', () => {
  test('permite seleccionar acciones dentro del presupuesto y completar una partida', async ({
    page,
  }) => {
    await page.goto('./#/challenge')

    // 1. Encabezado principal
    await expect(page.locator('h1')).toHaveText('Reto')

    // 2. Presupuesto inicial
    const budgetDisplay = page.locator('#challenge-budget-display')
    await expect(budgetDisplay).toContainText('1000')

    // 3. Seleccionar acciones (Hubs: 350 cr, Micro-segmentación: 300 cr)
    await page.click('.action-card[data-action-id="hubs"]')
    await expect(budgetDisplay).toContainText('650')

    await page.click('.action-card[data-action-id="segmentation"]')
    await expect(budgetDisplay).toContainText('350')

    // 4. Lanzar defensa
    await page.click('#btn-start-defense')

    // 5. Verificar pantalla de resultados
    await expect(page.locator('#challenge-results-card')).toBeVisible()
    await expect(page.locator('#challenge-setup-card')).toBeHidden()

    await expect(page.locator('#res-score')).toBeVisible()
    await expect(page.locator('#res-saved-pct')).toBeVisible()
    await expect(page.locator('#res-credits-left')).toContainText('350')

    // 6. Reiniciar partida
    await page.click('#btn-replay')
    await expect(page.locator('#challenge-setup-card')).toBeVisible()
    await expect(page.locator('#challenge-results-card')).toBeHidden()
    await expect(budgetDisplay).toContainText('1000')
  })

  test('la página de reto no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/challenge')

    // Auditoría a11y en sala de operaciones
    const a11ySetup = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const severeSetup = a11ySetup.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(severeSetup).toEqual([])

    // Ejecutar partida para auditar también la pantalla de resultados
    await page.click('.action-card[data-action-id="hubs"]')
    await page.click('#btn-start-defense')
    await expect(page.locator('#challenge-results-card')).toBeVisible()

    const a11yResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const severeResults = a11yResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(severeResults).toEqual([])
  })
})
