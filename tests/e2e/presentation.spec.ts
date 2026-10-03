import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Modo Presentación y Estilos de Impresión (F9)', () => {
  test('permite alternar el modo presentación mediante botón y atajo de teclado', async ({
    page,
  }) => {
    await page.goto('./#/')

    const presentationBtn = page.locator('#presentation-toggle')
    await expect(presentationBtn).toBeVisible()

    // 1. Activar con botón
    await presentationBtn.click()
    const isPresentation = await page.evaluate(() => document.documentElement.dataset.presentation)
    expect(isPresentation).toBe('true')

    // 2. Salir con el banner flotante
    const exitBanner = page.locator('#exit-presentation')
    await expect(exitBanner).toBeVisible()
    await exitBanner.click()

    const isExited = await page.evaluate(() => document.documentElement.dataset.presentation)
    expect(isExited).toBe('false')

    // 3. Activar con atajo de teclado (tecla F)
    await page.keyboard.press('KeyF')
    const isPresentationKey = await page.evaluate(
      () => document.documentElement.dataset.presentation
    )
    expect(isPresentationKey).toBe('true')

    // 4. Salir con Escape
    await page.keyboard.press('Escape')
    const isExitedKey = await page.evaluate(() => document.documentElement.dataset.presentation)
    expect(isExitedKey).toBe('false')
  })

  test('emula medios de impresión (print.css) ocultando cabecera y pie de página', async ({
    page,
  }) => {
    await page.goto('./#/simulator')

    // Emular @media print
    await page.emulateMedia({ media: 'print' })

    // En print.css el header debe estar oculto
    const headerDisplay = await page
      .locator('#site-header')
      .evaluate((el) => window.getComputedStyle(el).display)
    expect(headerDisplay).toBe('none')

    const footerDisplay = await page
      .locator('#site-footer')
      .evaluate((el) => window.getComputedStyle(el).display)
    expect(footerDisplay).toBe('none')
  })

  test('el modo presentación y la navegación no presentan violaciones críticas de accesibilidad', async ({
    page,
  }) => {
    await page.goto('./#/')
    await page.locator('#presentation-toggle').click()

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const severeViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(severeViolations).toEqual([])
  })
})
