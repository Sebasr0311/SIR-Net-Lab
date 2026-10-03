import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Calibración y Estimación de Parámetros (F6)', () => {
  test('la página de calibración carga correctamente y ejecuta ajuste Nelder-Mead y Bootstrap', async ({
    page,
  }) => {
    await page.goto('./#/calibration')

    // 1. Encabezado principal y elementos base
    await expect(page.locator('h1')).toHaveText('Calibración')
    await expect(page.locator('#data-count-label')).toContainText('observaciones')

    // 2. Gráficos presentes
    await expect(page.locator('.calibration-chart-card canvas')).toBeVisible()
    await expect(page.locator('.cost-surface-heatmap-card canvas')).toBeVisible()

    // 3. Ejecutar calibración Nelder-Mead
    const btnFit = page.locator('#btn-fit-model')
    await expect(btnFit).toBeEnabled()
    await btnFit.click()

    // 4. Verificar actualización de KPIs numéricos
    await expect(page.locator('#kpi-beta')).not.toHaveText('—')
    await expect(page.locator('#kpi-gamma')).not.toHaveText('—')
    await expect(page.locator('#kpi-r0')).not.toHaveText('—')
    await expect(page.locator('#kpi-rmse')).not.toHaveText('—')
    await expect(page.locator('#kpi-r2')).not.toHaveText('—')

    // 5. Ejecutar cálculo de Bootstrap
    const btnBootstrap = page.locator('#btn-run-bootstrap')
    await expect(btnBootstrap).toBeEnabled()
    await btnBootstrap.click()

    // 6. Verificar intervalos de confianza calculados
    await expect(page.locator('#ci-beta')).toContainText('IC 95%:')
    await expect(page.locator('#ci-beta')).not.toContainText('IC 95%: —')
    await expect(page.locator('#ci-gamma')).toContainText('IC 95%:')
    await expect(page.locator('#ci-gamma')).not.toContainText('IC 95%: —')
  })

  test('permite alternar a modo CSV y procesar un dataset de ejemplo', async ({ page }) => {
    await page.goto('./#/calibration')

    // 1. Cambiar a modo CSV
    await page.click('#btn-source-csv')
    await expect(page.locator('#section-csv')).toBeVisible()
    await expect(page.locator('#section-synthetic')).toBeHidden()

    // 2. Cargar ejemplo
    await page.click('#btn-sample-csv')
    await expect(page.locator('#data-count-label')).toContainText('11 observaciones')

    // 3. Calibrar con los datos del CSV
    await page.click('#btn-fit-model')
    await expect(page.locator('#kpi-beta')).not.toHaveText('—')
    await expect(page.locator('#kpi-rmse')).not.toHaveText('—')
  })

  test('la página de calibración no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/calibration')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const severeViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(severeViolations).toEqual([])
  })
})
