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

module.exports = config;
