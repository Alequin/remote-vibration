import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { darkCyan, darkSpaceCadet } from "../utilities/colours";

export const withBackground = (ChildComponent) => (props) => (
  <Background>
    <ChildComponent {...props} />
  </Background>
);

const Background = ({ style, children, ...otherProps }) => {
  const styleToUse = useMemo(
    () => ({
      ...ViewStyles.backgroundImage,
      ...style,
    }),
    [ViewStyles.container, style]
  );

  return (
    <LinearGradient
      // Button Linear Gradient
      colors={[darkCyan, darkCyan, darkSpaceCadet]}
      style={styleToUse}
    >
      {children}
    </LinearGradient>
  );
};

const ViewStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "red",
    alignItems: "center",
  },
});
