const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v9+ uses .cjs files for some modules
config.resolver.sourceExts.push('cjs');

module.exports = config;
