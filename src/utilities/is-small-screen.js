import { Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export const isSmallScreenHeight = () => windowHeight < 500;
export const isSmallScreenWidth = () => windowWidth < 350;
export const islargeScreenWidth = () => {
  return !isSmallScreenWidth() && windowWidth > 450;
};
