import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Simulación en Redes (F4)', () => {
  test('la página de red carga componentes, métricas topológicas y lienzo', async ({ page }) => {
    await page.goto('./#/network')

    // Verificar encabezado principal
    await expect(page.locator('h1')).toHaveText('Red')

    // Verificar KPIs de red
    await expect(page.locator('#kpi-mean-k')).toBeVisible()
    await expect(page.locator('#kpi-k2')).toBeVisible()
    await expect(page.locator('#kpi-lambda-c')).toBeVisible()
    await expect(page.locator('#kpi-r0-net')).toBeVisible()

    // Verificar lienzo del grafo y controles
    await expect(page.locator('.network-canvas-wrap canvas')).toBeVisible()
    await expect(page.locator('.btn-play')).toBeVisible()
  })

  test('los controles de transporte permiten reproducir y pausar', async ({ page }) => {
    await page.goto('./#/network')

    // Esperar a que el grafo termine de inicializarse y esté listo para reproducir
    await expect(page.locator('.network-canvas-card[data-ready="true"]')).toBeVisible({
      timeout: 10000,
    })

    const btnPlay = page.locator('.btn-play')
    await expect(btnPlay).toHaveText(/Reproducir/)

    await btnPlay.click()
    await expect(btnPlay).toHaveText(/Pausar/)

    await btnPlay.click()
    await expect(btnPlay).toHaveText(/Reproducir/)
  })

  test('cambiar de topología actualiza los parámetros dinámicos', async ({ page }) => {
    await page.goto('./#/network')

    // Cambiar a Erdős (ER)
    await page.click('button[data-value="er"]')
    await expect(page.locator('label', { hasText: 'Probabilidad de enlace' })).toBeVisible()

    // Cambiar a Watts (WS)
    await page.click('button[data-value="ws"]')
    await expect(page.locator('label', { hasText: 'Grado regular inicial' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Reconexión (Rewiring)' })).toBeVisible()
  })

  test('el comparador EDO vs Red ejecuta el lote Monte Carlo', async ({ page }) => {
    await page.goto('./#/network')

    const btnBatch = page.locator('.btn', { hasText: 'Comparar con EDO' })
    await expect(btnBatch).toBeVisible()
    await btnBatch.click()

    // Al finalizar el cálculo debe reportar la discrepancia RMSE
    const rmseStrong = page.locator('#rmse-val')
    await expect(rmseStrong).not.toHaveText('—', { timeout: 15000 })
  })

  test('la página de red no presenta violaciones críticas ni serias de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/network')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalOrSerious).toEqual([])
  })
})
