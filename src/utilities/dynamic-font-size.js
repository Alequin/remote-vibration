import { Dimensions, Platform, PixelRatio } from "react-native";
import { isSmallScreen } from "./is-small-screen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
console.log(
  "🚀 ~ file: dynamic-font-size.js ~ line 5 ~ SCREEN_WIDTH",
  SCREEN_WIDTH
);

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export const dynamicFontSize = (size) => {
  const newSize = scaleModifier(size) * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const scaleModifier = (size) => {
  if (isSmallScreen()) return size - 2;
  if (SCREEN_WIDTH > 700) return size - 6;
  return size;
};
