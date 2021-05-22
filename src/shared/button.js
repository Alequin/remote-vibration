import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyledText } from "./styled-text";

export const Button = ({ ...otherProps }) => (
  <TouchableOpacity accessibilityRole="button" {...otherProps} />
);

export const ButtonText = ({ style, ...otherProps }) => (
  <StyledText
    style={useMemo(() => ({ ...ViewStyles.buttonText, ...style }), [style])}
    {...otherProps}
  />
);

const ViewStyles = StyleSheet.create({
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    fontFamily: "sans-serif-medium",
  },
});
