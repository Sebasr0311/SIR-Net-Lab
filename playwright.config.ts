import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173/SIR-Net-Lab/',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/SIR-Net-Lab/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
