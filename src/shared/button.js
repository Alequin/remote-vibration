import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SerifText } from "./serif-text";
import { spaceCadet } from "../utilities/colours";
import { borderRadius } from "./border-radius";

export const Button = ({ style: customStyles, children, ...otherProps }) => {
  const buttonStyle = useMemo(
    () => ({ ...ViewStyles.button, ...customStyles }),
    [customStyles]
  );

  return (
    <View style={buttonStyle} accessibilityRole="button">
      <TouchableOpacity {...otherProps} style={ViewStyles.innerButton}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

export const ButtonText = ({ style, ...otherProps }) => {
  const styleToUse = useMemo(() => ({ ...ViewStyles.buttonText, ...style }), [
    style,
  ]);

  return <SerifText style={styleToUse} {...otherProps} />;
};

const ViewStyles = StyleSheet.create({
  button: {
    backgroundColor: spaceCadet,
    borderColor: "white",
    borderWidth: 1,
    borderRadius,
  },
  innerButton: {
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    fontFamily: "sans-serif-medium",
  },
});
