import { Dimensions, Platform, PixelRatio } from "react-native";
import { isSmallScreen } from "./is-small-screen";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export const dynamicFontSize = (size) => {
  const newSize = (isSmallScreen() ? size - 2 : size) * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};
