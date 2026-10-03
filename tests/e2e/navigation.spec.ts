import { test, expect } from '@playwright/test'

test.describe('Navegación y accesibilidad básica', () => {
  test('la página de inicio muestra el título y la descripción', async ({ page }) => {
    await page.goto('./#/')
    await expect(page.locator('h1')).toHaveText('SIR-Net Lab')
  })

  test('la navegación por enlaces de la cabecera actualiza la vista', async ({ page }) => {
    await page.goto('./#/')

    // Navegar a Simulador
    await page.click('nav a[href="#/simulator"]')
    await expect(page).toHaveURL(/.*#\/simulator/)
    await expect(page.locator('h1')).toHaveText('Simulador')

    // Navegar a Red
    await page.click('nav a[href="#/network"]')
    await expect(page).toHaveURL(/.*#\/network/)
    await expect(page.locator('h1')).toHaveText('Red')

    // Navegar a UI Kit
    await page.goto('./#/ui-kit')
    await expect(page.locator('h1')).toHaveText('UI Kit — Sistema de diseño')
  })

  test('el botón de tema conmuta entre tema claro y oscuro', async ({ page }) => {
    await page.goto('./#/')
    const themeBtn = page.locator('#theme-toggle')
    await expect(themeBtn).toBeVisible()

    // Leer tema inicial
    const initialTheme = await page.locator('html').getAttribute('data-theme')

    // Conmutar tema
    await themeBtn.click()
    const newTheme = await page.locator('html').getAttribute('data-theme')
    expect(newTheme).not.toBe(initialTheme)

    // Conmutar de vuelta
    await themeBtn.click()
    const revertedTheme = await page.locator('html').getAttribute('data-theme')
    expect(revertedTheme).toBe(initialTheme)
  })

  test('el skip-link está presente y es accesible', async ({ page }) => {
    await page.goto('./#/')
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toHaveAttribute('href', '#main')
  })
})
