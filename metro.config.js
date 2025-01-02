const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for PDF and platform-specific files
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(','), ...config.resolver.sourceExts]
  : ['web.tsx', 'web.ts', 'web.js', 'tsx', 'ts', 'js'];

config.resolver.assetExts = [...config.resolver.assetExts, 'pdf'];

// Handle platform-specific modules
config.resolver.resolverMainFields = ['browser', 'react-native', 'main'];

// Ensure proper handling of platform-specific files
config.resolver.platforms = ['web', 'ios', 'android'];

// Add aliases for web-specific modules
config.resolver.extraNodeModules = {
  'react-native-web': require.resolve('react-native-web'),
  '@react-navigation/native': require.resolve('@react-navigation/native'),
  '@react-navigation/core': require.resolve('@react-navigation/core'),
  '@react-navigation/bottom-tabs': require.resolve('@react-navigation/bottom-tabs'),
  '@react-navigation/stack': require.resolve('@react-navigation/stack'),
  'react-native-safe-area-context': require.resolve('react-native-safe-area-context'),
  'react-native-screens': require.resolve('react-native-screens'),
  '@react-native-masked-view/masked-view': require.resolve('@react-native-masked-view/masked-view'),
  'react-native-gesture-handler': require.resolve('react-native-gesture-handler'),
  '@rneui/themed': require.resolve('@rneui/themed'),
  '@rneui/base': require.resolve('@rneui/base'),
  'react-native-elements': require.resolve('react-native-elements'),
  'react-native-vector-icons': require.resolve('react-native-vector-icons'),
};

// Configure asset handling for vector icons
config.resolver.assetExts = [...config.resolver.assetExts, 'ttf'];

// Ensure proper module resolution
config.resolver.disableHierarchicalLookup = false;
config.resolver.nodeModulesPaths = [
  ...config.resolver.nodeModulesPaths || [],
  require('path').resolve(__dirname, 'node_modules'),
];

module.exports = config;
