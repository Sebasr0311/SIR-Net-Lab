import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Simulador EDO (F3)', () => {
  test('la página del simulador carga componentes, KPIs y gráficos', async ({ page }) => {
    await page.goto('./#/simulator')

    // Verificar panel de parámetros y KPIs
    await expect(page.locator('.param-panel')).toBeVisible()
    await expect(page.locator('.kpi-bar')).toBeVisible()
    await expect(page.locator('#kpi-r0')).toBeVisible()

    // Verificar gráficos
    await expect(page.locator('.time-chart-card canvas')).toBeVisible()
    await expect(page.locator('.phase-plot-card canvas')).toBeVisible()
  })

  test('cambiar de escenario actualiza los KPIs y el semáforo en vivo', async ({ page }) => {
    await page.goto('./#/simulator')

    const select = page.locator('#scenario-select')
    const kpiR0 = page.locator('#kpi-r0 .kpi-card__value')
    const badgeR0 = page.locator('#kpi-r0 .badge-r0')

    // Seleccionar 'brote-contenido' (R0 = 0.75)
    await select.selectOption('brote-contenido')
    await expect(kpiR0).toHaveText('0.75')
    await expect(badgeR0).toHaveAttribute('data-level', 'ok')
    await expect(badgeR0).toContainText('Controlado')

    // Seleccionar 'gusano-red-local' (R0 = 3.00)
    await select.selectOption('gusano-red-local')
    await expect(kpiR0).toHaveText('3.00')
    await expect(badgeR0).toHaveAttribute('data-level', 'danger')
    await expect(badgeR0).toContainText('Epidemia')
  })

  test('el botón de tabla de datos alterna la visualización accesible', async ({ page }) => {
    await page.goto('./#/simulator')

    const toggleBtn = page.locator('.btn-toggle-table')
    const tableWrap = page.locator('.data-table-wrap')

    await expect(tableWrap).toBeHidden()
    await toggleBtn.click()
    await expect(tableWrap).toBeVisible()

    // Verificar que contiene filas con datos
    const rows = page.locator('.table-body tr')
    await expect(rows.first()).toBeVisible()
  })

  test('los botones de exportación a Excel (.xls) y CSV funcionan correctamente', async ({
    page,
  }) => {
    await page.goto('./#/simulator')

    const btnExcel = page.locator('.btn-download-excel')
    const btnCsv = page.locator('.btn-download-csv')

    await expect(btnExcel).toBeVisible()
    await expect(btnCsv).toBeVisible()

    // Comprobar evento de descarga de Excel
    const downloadPromiseExcel = page.waitForEvent('download')
    await btnExcel.click()
    const downloadExcel = await downloadPromiseExcel
    expect(downloadExcel.suggestedFilename()).toBe('sir-net-lab-simulacion.xls')

    // Comprobar evento de descarga de CSV
    const downloadPromiseCsv = page.waitForEvent('download')
    await btnCsv.click()
    const downloadCsv = await downloadPromiseCsv
    expect(downloadCsv.suggestedFilename()).toBe('sir-net-lab-series.csv')
  })

  test('la página del simulador no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/simulator')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalOrSerious).toEqual([])
  })
})
