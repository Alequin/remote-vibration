import { Dimensions, Platform, PixelRatio } from "react-native";
import { isSmallScreenHeight } from "./is-small-screen";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 400;

export const dynamicFontSize = (requestedSize) => {
  const size = Math.round(
    PixelRatio.roundToNearestPixel(scaleModifier(requestedSize) * scale)
  );

  return Platform.OS === "ios" ? size : size - 2;
};

const scaleModifier = (size) => {
  if (isSmallScreenHeight()) return size - 2;
  if (SCREEN_WIDTH > 700) return size - 5;
  return size;
};
