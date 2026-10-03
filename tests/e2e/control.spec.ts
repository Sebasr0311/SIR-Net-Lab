import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Control y Estrategias (F5)', () => {
  test('la página de control carga KPIs, gráfica EDO y permite alternar a red', async ({
    page,
  }) => {
    await page.goto('./#/control')

    // 1. Encabezado principal
    await expect(page.locator('h1')).toHaveText('Control')

    // 2. KPIs de EDO
    await expect(page.locator('#kpi-prevented')).toBeVisible()
    await expect(page.locator('#kpi-peak-red')).toBeVisible()
    await expect(page.locator('#kpi-pc')).toBeVisible()

    // 3. Gráfica EDO por impulsos
    await expect(page.locator('.edo-campaign-chart-card canvas')).toBeVisible()

    // 4. Agregar un nuevo impulso
    const countBefore = await page.locator('#impulses-list > div').count()
    await page.click('.btn-add-impulse')
    const countAfter = await page.locator('#impulses-list > div').count()
    expect(countAfter).toBe(countBefore + 1)

    // 5. Alternar a la pestaña de red
    await page.click('.btn-tab-network')
    await expect(page.locator('#panel-network')).toBeVisible()
    await expect(page.locator('#panel-edo')).toBeHidden()

    // 6. Verificar tabla y gráfico de red
    await expect(page.locator('.strategy-comparison-chart-card canvas')).toBeVisible()
    await expect(page.locator('.strategy-table-card table')).toBeVisible()
  })

  test('la evaluación de estrategias en red ejecuta la simulación pareada', async ({ page }) => {
    await page.goto('./#/control')

    // Cambiar a red y ejecutar evaluación
    await page.click('.btn-tab-network')
    await page.click('.btn-run-strategies')

    // Esperar a que la tabla tenga filas calculadas
    const rows = page.locator('.strategy-table-body tr')
    await expect(rows.first()).toBeVisible()
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThanOrEqual(3)

    // Verificar banner de resumen
    await expect(page.locator('#strategy-summary-banner')).toBeVisible()
    await expect(page.locator('#strategy-summary-text')).not.toBeEmpty()
  })

  test('la página de control no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/control')

    // Auditoría en pestaña EDO
    const a11yEdo = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const severeEdo = a11yEdo.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(severeEdo).toEqual([])

    // Auditoría en pestaña Red
    await page.click('.btn-tab-network')
    const a11yNet = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const severeNet = a11yNet.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(severeNet).toEqual([])
  })
})
