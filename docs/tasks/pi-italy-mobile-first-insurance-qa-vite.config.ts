import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
export default defineConfig({
  root: path.resolve('docs/tasks'),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve('src') } },
  build: {
    outDir: path.resolve('.codex-temp/pi-it-insurance-qa/build'),
    emptyOutDir: false,
    rollupOptions: { input: path.resolve('docs/tasks/pi-italy-mobile-first-insurance-qa.html') },
  },
})
