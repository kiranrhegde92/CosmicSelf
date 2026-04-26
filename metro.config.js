// SDK 55 / Metro 0.81 enables Package Exports by default but its
// `unstable_conditionNames` list doesn't include `react-native`. Firebase
// (and other packages that distinguish RN vs browser entries via the
// modern `exports` map) end up resolving to their browser bundle, which
// for `firebase/auth` skips the side-effect that registers the auth
// component → boot crash:
//
//   Render Error: Component auth has not been registered yet
//
// Adding `react-native` to the conditions makes Metro pick the right
// entry and the auth component registers as a side effect of import.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'require',
  'react-native',
  'browser',
];

module.exports = config;
