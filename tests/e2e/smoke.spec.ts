import { test, expect } from '@playwright/test'

test('smoke: la página carga y tiene título', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})
