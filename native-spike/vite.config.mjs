import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [
    {
      name: 'italy-search-migration-bridge',
      enforce: 'pre',
      resolveId(source, importer) {
        if (
          source === './MobileFirstSearch' &&
          importer
            ?.replaceAll('\\', '/')
            .endsWith('/src/experiences/pi/it/mobile-first/MobileFirstHome.tsx')
        )
          return normalizePath(
            fileURLToPath(
              new URL(
                './src/experiences/pi/it/SearchBridge.web.jsx',
                import.meta.url,
              ),
            ),
          );
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    extensions: [
      '.web.mjs',
      '.mjs',
      '.web.js',
      '.js',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.json',
      '.jsx',
    ],
    alias: [
      {
        find: '@react-native/assets-registry/registry',
        replacement: fileURLToPath(
          new URL(
            './node_modules/react-native-web/dist/modules/AssetRegistry/index.js',
            import.meta.url,
          ),
        ),
      },
      { find: /^react-native$/, replacement: 'react-native-web' },
      {
        find: /^react-native-svg$/,
        replacement: fileURLToPath(
          new URL(
            './node_modules/react-native-svg/lib/module/ReactNativeSVG.web.js',
            import.meta.url,
          ),
        ),
      },
      {
        find: /^figma:asset\/(.*)$/,
        replacement: fileURLToPath(
          new URL('../src/assets/$1', import.meta.url),
        ),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('../src', import.meta.url)),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.tsx',
        '.tsx',
        '.json',
        '.jsx',
      ],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4006,
    strictPort: true,
    watch: { ignored: ['**/android/**', '**/ios/**', '**/.codex-temp/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        globalNative: fileURLToPath(new URL('./global-native.html', import.meta.url)),
        italyMigration: fileURLToPath(
          new URL('./italy-migration.html', import.meta.url),
        ),
        italyNative: fileURLToPath(
          new URL('./italy-native.html', import.meta.url),
        ),
      },
    },
  },
});
