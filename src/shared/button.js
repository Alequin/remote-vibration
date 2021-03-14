import React from "react";
import { useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { borderRadius } from "./border-radius";

export const Button = ({
  style: customStyles,
  isTop,
  isBottom,
  children,
  ...otherProps
}) => {
  const buttonStyle = useMemo(() => {
    if (isTop) return { ...ViewStyles.topButton, ...customStyles };
    if (isBottom) return { ...ViewStyles.bottomButton, ...customStyles };
    return { ...ViewStyles.button, ...customStyles };
  }, [isTop, isBottom]);

  return (
    <View style={buttonStyle} accessibilityRole="button">
      <TouchableOpacity {...otherProps} style={ViewStyles.innerButton}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

const baseButton = {
  backgroundColor: "transparent",
  borderColor: "white",
  borderWidth: 1,
};

const ViewStyles = StyleSheet.create({
  topButton: {
    ...baseButton,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  },
  button: baseButton,
  bottomButton: {
    ...baseButton,
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
  },
  innerButton: {
    width: "100%",
  },
});
