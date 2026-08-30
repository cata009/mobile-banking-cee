import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^figma:asset\/(.*)$/, replacement: path.resolve(__dirname, './src/assets/$1') },
    ],
  },
  test: {
    environment: 'node',
    testTimeout: 15_000,
    include: ['tests/**/*.test.{ts,tsx,mjs}'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 62,
        lines: 80,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/imports/**',
        'src/app/registry/componentCodeSamples/**',
        'src/app/registry/componentImplementationPackages.ts',
      ],
    },
  },
})
