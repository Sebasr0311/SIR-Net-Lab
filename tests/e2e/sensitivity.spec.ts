import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Análisis de Sensibilidad y Barridos (F7)', () => {
  test('la página de sensibilidad carga el gráfico tornado y permite alternar métricas', async ({
    page,
  }) => {
    await page.goto('./#/sensitivity')

    // 1. Encabezado principal
    await expect(page.locator('h1')).toHaveText('Sensibilidad')

    // 2. Gráfico tornado visible
    await expect(page.locator('.tornado-chart-card canvas')).toBeVisible()
    await expect(page.locator('#local-base-val')).not.toHaveText('—')

    // 3. Cambiar la métrica a R0
    await page.selectOption('#select-tornado-metric', 'r0')
    await expect(page.locator('#local-base-val')).toHaveText('3.00')
    await expect(page.locator('#local-top-param')).toHaveText(/BETA|GAMMA/)
  })

  test('permite alternar al barrido 2D y al análisis global LHS', async ({ page }) => {
    await page.goto('./#/sensitivity')

    // 1. Ir a Barrido 2D
    await page.click('#tab-sweep')
    await expect(page.locator('#panel-sweep')).toBeVisible()
    await expect(page.locator('#panel-tornado')).toBeHidden()
    await expect(page.locator('.sweep-heatmap-card canvas')).toBeVisible()

    // 2. Actualizar barrido
    await page.click('#btn-recompute-sweep')

    // 3. Ir a Sensibilidad Global LHS
    await page.click('#tab-lhs')
    await expect(page.locator('#panel-lhs')).toBeVisible()
    await expect(page.locator('.monte-carlo-histogram-card canvas')).toBeVisible()

    // 4. Ejecutar simulación LHS en worker
    await page.click('#btn-run-lhs')

    // 5. Verificar que se actualicen los KPIs
    await expect(page.locator('#kpi-lhs-outbreak')).not.toHaveText('—')
    await expect(page.locator('#kpi-lhs-mean')).not.toHaveText('—')
    await expect(page.locator('#kpi-lhs-ci')).not.toHaveText('—')
  })

  test('la página de sensibilidad no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/sensitivity')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const severeViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(severeViolations).toEqual([])
  })
})
