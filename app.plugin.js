// Expo config plugin entry point for `react-native-tiktok-business-sdk`.
// Must remain CommonJS so it loads correctly when Expo resolves the plugin
// from `app.json` / `app.config.ts`, regardless of the consuming app's setup.
module.exports = require('./plugin/build/withTikTokBusiness');
