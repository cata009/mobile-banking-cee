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
  },
})
