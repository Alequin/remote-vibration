import React, { useMemo } from "react";
import { StyleSheet, ImageBackground } from "react-native";

export const Background = ({ style, children, ...otherProps }) => {
  const styleToUse = useMemo(
    () => ({
      ...ViewStyles.backgroundImage,
      ...style,
    }),
    [ViewStyles.container, style]
  );

  return (
    <ImageBackground
      source={require("../assets/background.webp")}
      style={styleToUse}
      {...otherProps}
    >
      {children}
    </ImageBackground>
  );
};

const ViewStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
});
