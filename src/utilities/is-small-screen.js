import { Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;

export const isSmallScreen = () => windowHeight < 500;
