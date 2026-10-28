// Preserve lazy native exports introduced after this NativeWind preview shipped.
// Copy descriptors rather than values: eagerly loading native components creates
// initialization cycles before Expo Go has registered its native modules.
const native = require("react-native");
const styled = require("react-native-css/components");

module.exports = Object.defineProperties({}, {
  ...Object.getOwnPropertyDescriptors(native),
  ...Object.getOwnPropertyDescriptors(styled),
});
