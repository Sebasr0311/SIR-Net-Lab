import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/SIR-Net-Lab/',
  test: {
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**', 'src/sim/**'],
      threshold: {
        lines: 90,
      },
    },
  },
})
