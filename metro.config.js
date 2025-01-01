const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for PDF and blob utilities in web builds
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];
config.resolver.assetExts = [...config.resolver.assetExts, 'pdf'];

// Handle platform-specific modules
config.resolver.resolverMainFields = ['browser', 'main'];

module.exports = config;
