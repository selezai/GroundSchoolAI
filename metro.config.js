const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure resolver
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    'memoize-one': path.resolve(__dirname, 'node_modules/memoize-one'),
  },
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'web'],
  assetExts: [...config.resolver.assetExts, 'web.js', 'web.jsx', 'web.ts', 'web.tsx'],
  sourceExts: [...config.resolver.sourceExts, 'web.js', 'web.jsx', 'web.ts', 'web.tsx'],
};

// Configure watchFolders
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

// Configure transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Configure cacheVersion to force cache invalidation
config.cacheVersion = '1.0';

module.exports = config;
