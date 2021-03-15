import React from "react";
import { useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, AntDesign } from "react-native";

export const BorderlessButton = ({
  style: customStyles,
  children,
  ...otherProps
}) => {
  const buttonStyle = useMemo(() => {
    return { ...ViewStyles.button, ...customStyles };
  }, [customStyles]);

  return (
    <View style={buttonStyle} accessibilityRole="button">
      <TouchableOpacity {...otherProps} style={ViewStyles.innerButton}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    borderColor: "white",
  },

  innerButton: {
    width: "100%",
  },
});
