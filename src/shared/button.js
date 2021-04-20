import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { StyledText } from "./styled-text";

export const Button = ({ children, ...otherProps }) => {
  return (
    <TouchableOpacity accessibilityRole="button" {...otherProps}>
      {children}
    </TouchableOpacity>
  );
};

export const ButtonText = ({ style, ...otherProps }) => {
  const styleToUse = useMemo(() => ({ ...ViewStyles.buttonText, ...style }), [
    style,
  ]);

  return <StyledText style={styleToUse} {...otherProps} />;
};

const ViewStyles = StyleSheet.create({
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    fontFamily: "sans-serif-medium",
  },
});
