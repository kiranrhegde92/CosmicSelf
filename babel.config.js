module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated 4 split worklets out into a separate package. The babel
    // plugin moved with it; the old `react-native-reanimated/plugin` is
    // gone in 4.x and replaced by this. Keep this LAST in the plugin list.
    plugins: ['react-native-worklets/plugin'],
  };
};
