import { test, expect } from '@playwright/test'

test.describe('Auditoría de integridad y consola en producción', () => {
  test('la aplicación carga sin errores de consola ni recursos 404', async ({ page }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('requestfailed', (request) => {
      failedRequests.push(
        `${request.method()} ${request.url()} - ${request.failure()?.errorText ?? 'failed'}`
      )
    })

    const response = await page.goto('./', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)

    // Título y navegación montados
    await expect(page).toHaveTitle(/SIR-Net Lab/)
    await expect(page.locator('#site-header')).toBeVisible()

    // Navegar a simulador
    await page.goto('./#/simulator', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Simulador/i)
    await expect(page.locator('#kpi-r0')).toBeVisible()

    // Navegar a red
    await page.goto('./#/network', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Red/i)
    await expect(page.locator('.network-canvas-wrap canvas')).toBeVisible()

    // Navegar a control
    await page.goto('./#/control', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Control/i)

    // Navegar a calibración
    await page.goto('./#/calibration', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Calibración/i)

    // Navegar a sensibilidad
    await page.goto('./#/sensitivity', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Sensibilidad/i)

    // Navegar a teoría
    await page.goto('./#/theory', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Fundamentos|Teoría/i)

    // Comprobar que no hubo errores en consola ni peticiones fallidas
    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
  })
})
