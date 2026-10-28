const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("node:path");
 
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
 
const styledConfig = withNativewind(config);
const styledResolver = styledConfig.resolver.resolveRequest;
const compatibilityModule = path.resolve(__dirname, "metro/react-native-compat.cjs");

styledConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  // The compatibility module must read the original React Native exports.
  if (context.originModulePath === compatibilityModule && moduleName === "react-native") {
    return context.resolveRequest(context, moduleName, platform);
  }
  const resolution = styledResolver(context, moduleName, platform);
  if (
    platform !== "web" &&
    moduleName === "react-native" &&
    resolution.type === "sourceFile" &&
    /react-native-css[\\/]dist[\\/](?:commonjs|module)[\\/]components[\\/]index\.cjs$/.test(resolution.filePath)
  ) {
    return { type: "sourceFile", filePath: compatibilityModule };
  }
  return resolution;
};

module.exports = styledConfig;
