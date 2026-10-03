import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/SIR-Net-Lab/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string): string | void {
          if (id.includes('node_modules/chart.js')) return 'vendor-chart'
          if (id.includes('node_modules/katex')) return 'vendor-katex'
          if (id.includes('node_modules/d3-force')) return 'vendor-d3'
        },
      },
    },
  },
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
