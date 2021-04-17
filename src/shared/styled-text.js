import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { textShadow } from "./text-shadow-style";

export const StyledText = ({ style, children, ...otherProps }) => (
  <Text style={useStyle(style)} {...otherProps}>
    {children}
  </Text>
);

const useStyle = (style) =>
  useMemo(
    () => ({
      ...ViewStyles.text,
      ...style,
    }),
    [style]
  );

const ViewStyles = StyleSheet.create({
  text: {
    color: "white",
    fontFamily: "sans-serif-medium",
    ...textShadow,
  },
});
