import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SerifText } from "./serif-text";
import { spaceCadet } from "../utilities/colours";

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

  return <SerifText style={styleToUse} {...otherProps} />;
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
