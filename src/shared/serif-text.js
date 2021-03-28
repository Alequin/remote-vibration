import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";

export const SerifText = ({ style, ...otherProps }) => {
  const styleToUse = useMemo(() => ({ ...ViewStyles.text, ...style }), [style]);
  return <Text style={styleToUse} {...otherProps} />;
};

const ViewStyles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 17,
    fontFamily: "sans-serif-medium",
  },
});
