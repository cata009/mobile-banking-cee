const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');
const defaults = getDefaultConfig(__dirname);
const config = {
  // Canonical source models/assets and the original catalogue artwork; dependencies resolve here.
  watchFolders: [
    path.resolve(__dirname, '../src'),
    path.resolve(__dirname, '../screenshots'),
    path.resolve(__dirname, '../package/mobile-pi-coapping-chat-package/src'),
  ],
  resolver: {
    assetExts: defaults.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaults.resolver.sourceExts, 'svg'],
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    disableHierarchicalLookup: true,
    resolveRequest(context, moduleName, platform) {
      const mapped = moduleName.startsWith('@/')
        ? path.resolve(__dirname, '../src', moduleName.slice(2))
        : moduleName.startsWith('figma:asset/')
        ? path.resolve(
            __dirname,
            '../src/assets',
            moduleName.slice('figma:asset/'.length),
          )
        : moduleName;
      return context.resolveRequest(context, mapped, platform);
    },
  },
  transformer: {
    babelTransformerPath: require.resolve('./src/platform/svg-transformer.cjs'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
