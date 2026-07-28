import { defineConfig, type Plugin } from 'vite'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep executable entrypoints stable so a corporate proxy that retains
        // an older index.html never points at files removed by a new deployment.
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames(assetInfo) {
          const names = assetInfo.names ?? []
          return names.some((name) => name.endsWith('.css'))
            ? 'assets/app.css'
            : 'assets/[name]-[hash][extname]'
        },
        // Split the previously-monolithic ~2 MB App chunk into stable vendor
        // groups that cache independently and load in parallel. This is purely
        // a chunking change — no runtime behavior is affected.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          radix: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          motion: ['motion'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          date: ['date-fns', 'react-day-picker'],
          overlays: ['vaul', 'embla-carousel-react', 'cmdk', 'sonner'],
          forms: ['react-hook-form', 'input-otp'],
          utils: [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'react-resizable-panels',
            '@popperjs/core',
            'react-popper',
            'next-themes',
          ],
        },
      },
    },
  },
})
