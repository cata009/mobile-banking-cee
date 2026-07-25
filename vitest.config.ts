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
    include: ['tests/**/*.test.{ts,tsx,mjs}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
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
