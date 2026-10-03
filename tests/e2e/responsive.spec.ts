import { test, expect } from '@playwright/test'

test.describe('Responsividad y adaptación móvil (shadcn/ui)', () => {
  const routes = [
    '#/',
    '#/simulator',
    '#/network',
    '#/control',
    '#/calibration',
    '#/sensitivity',
    '#/challenge',
    '#/theory',
    '#/about',
  ]

  for (const route of routes) {
    test(`la ruta ${route} no desborda horizontalmente en viewport móvil (375px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`./${route}`)
      await page.waitForLoadState('domcontentloaded')

      // Verificar que el ancho del scroll del documento no exceda el viewport
      const { scrollWidth, windowWidth } = await page.evaluate(() => {
        return {
          scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
          windowWidth: window.innerWidth,
        }
      })

      expect(scrollWidth).toBeLessThanOrEqual(windowWidth + 1)
    })
  }

  test('la tabla de datos del simulador es responsiva y deslizable horizontalmente', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('./#/simulator')

    const btnToggle = page.locator('.btn-toggle-table')
    await btnToggle.click()

    const tableWrap = page.locator('.data-table-wrap')
    await expect(tableWrap).toBeVisible()

    // Comprobar que el contenedor de la tabla tenga scroll horizontal o se mantenga acotado
    const bounds = await tableWrap.boundingBox()
    expect(bounds).not.toBeNull()
    if (bounds) {
      expect(bounds.width).toBeLessThanOrEqual(375)
    }

    const table = page.locator('.data-table-wrap table')
    await expect(table).toBeVisible()
  })

  test('la tabla de estrategias de control es responsiva y acotada al contenedor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('./#/control')

    // Cambiar a pestaña de red
    await page.click('.btn-tab-network')

    const tableWrap = page.locator('.strategy-table-card .table-responsive')
    await expect(tableWrap).toBeVisible()

    const bounds = await tableWrap.boundingBox()
    expect(bounds).not.toBeNull()
    if (bounds) {
      expect(bounds.width).toBeLessThanOrEqual(375)
    }
  })

  test('los controles de parámetros (sliders) no se cortan ni desbordan en 360px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('./#/simulator')

    const sliderControls = page.locator('.slider-field__controls').first()
    await expect(sliderControls).toBeVisible()

    const bounds = await sliderControls.boundingBox()
    expect(bounds).not.toBeNull()
    if (bounds) {
      expect(bounds.width).toBeLessThanOrEqual(360)
    }
  })
})
