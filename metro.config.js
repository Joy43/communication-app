const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add this to ensure proper file watching
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "ts",
  "tsx",
  "js",
  "jsx",
];
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

// Ensure watchFolders includes node_modules
config.watchFolders = [__dirname];

module.exports = withNativeWind(config, { input: "./app/global.css" });
