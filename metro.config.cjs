const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
const previous = config.resolver.blockList;
// Keep SDK downloads, device evidence and local build caches out of Metro's file map.
config.resolver.blockList = [/[\\/]\.qa(?:[\\/]|$)/, ...(Array.isArray(previous) ? previous : previous ? [previous] : [])];
module.exports = config;
