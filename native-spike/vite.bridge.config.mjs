import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import nativeConfig from './vite.config.mjs';

const nativeRoot = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.NATIVE_DEMO_OUT_DIR
  ? path.resolve(process.env.NATIVE_DEMO_OUT_DIR)
  : path.join(nativeRoot, 'dist-host');
const nativeModules =
  nativeRoot.replaceAll('\\', '/').replace(/\/+$/, '') + '/node_modules/';

function isolatedReactRuntime() {
  return {
    name: 'native-host-isolated-react-runtime',
    generateBundle(_options, bundle) {
      const modules = Object.values(bundle)
        .filter(file => file.type === 'chunk')
        .flatMap(file => Object.keys(file.modules))
        .map(id => id.replaceAll('\\', '/'));
      const reactModules = modules.filter(id =>
        /\/node_modules\/(react|react-dom)\//.test(id),
      );
      if (
        !reactModules.some(id => id.includes(nativeModules + 'react/')) ||
        !reactModules.some(id => id.includes(nativeModules + 'react-dom/')) ||
        reactModules.some(id => !id.includes(nativeModules))
      ) {
        this.error(
          'Native host must bundle its own React and ReactDOM runtime',
        );
      }
    },
  };
}

/** Independent runtime: Source's React 18 bundle never links these React 19 modules. */
export default defineConfig({
  root: nativeRoot,
  base: './',
  publicDir: false,
  plugins: [...nativeConfig.plugins, isolatedReactRuntime()],
  resolve: nativeConfig.resolve,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  build: {
    target: 'es2022',
    outDir: output,
    emptyOutDir: false,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: {
      // A JS entry preserves the imperative exports without library mode's forced
      // asset inlining: fonts and artwork retain their normal hashed URLs.
      input: path.join(nativeRoot, 'src/web/currentHost.tsx'),
      preserveEntrySignatures: 'strict',
      external: [],
      output: {
        format: 'es',
        entryFileNames: 'current-host.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: asset =>
          asset.names?.some(name => name.endsWith('.css'))
            ? 'current-host.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
