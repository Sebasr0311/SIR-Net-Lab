import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/SIR-Net-Lab/',
  test: {
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      threshold: {
        lines: 90,
      },
    },
  },
})
