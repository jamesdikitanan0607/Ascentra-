const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle Node.js modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Block problematic Node.js modules and ws library
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /node_modules\/ws\/.*/,
  /node_modules\/@expo\/ws-tunnel\/.*/,
];

// Add module map for Node.js polyfills and block ws
config.resolver.alias = {
  ...config.resolver.alias,
  'stream': 'stream-browserify',
  'util': 'util',
  'crypto': 'react-native-crypto',
  'buffer': '@craftzdog/react-native-buffer',
  'ws': false,
  '@expo/ws-tunnel': false,
};

// Platform-specific extensions - ensure web extensions are checked first
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Additional resolver options
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block ws and related modules completely
  if (moduleName === 'ws' || moduleName.includes('ws/lib') || moduleName === '@expo/ws-tunnel') {
    return {
      type: 'empty',
    };
  }
  
  // Redirect react-native-maps to our web component on web platform
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'components/MapView.web.js'),
    };
  }
  
  // Block react-native-maps native modules on web
  if (platform === 'web' && (
    moduleName.includes('react-native/Libraries/Utilities/codegenNativeCommands') ||
    moduleName.includes('react-native/Libraries/Utilities/codegenNativeComponent') ||
    moduleName.includes('react-native-maps/lib/MapMarkerNativeComponent')
  )) {
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;