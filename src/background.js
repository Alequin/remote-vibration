import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export const Background = ({ style, ...otherProps }) => {
  const styleToUse = useMemo(
    () => ({
      ...ViewStyles.container,
      ...style,
    }),
    [ViewStyles.container, style]
  );

  return <View style={styleToUse} {...otherProps}></View>;
};

const ViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
});
