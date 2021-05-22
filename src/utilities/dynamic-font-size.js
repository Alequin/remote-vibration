import { Dimensions, Platform, PixelRatio } from "react-native";
import { isSmallScreen } from "./is-small-screen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export const dynamicFontSize = (requestedSize) => {
  const size = Math.round(
    PixelRatio.roundToNearestPixel(scaleModifier(requestedSize) * scale)
  );
  return Platform.OS === "ios" ? size : size - 2;
};

const scaleModifier = (size) => {
  if (isSmallScreen()) return size - 2;
  if (SCREEN_WIDTH > 700) return size - 6;
  return size;
};
