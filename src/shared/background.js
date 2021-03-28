import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export const Background = ({ style, children, ...otherProps }) => {
  const styleToUse = useMemo(
    () => ({
      ...ViewStyles.backgroundImage,
      ...style,
    }),
    [ViewStyles.container, style]
  );

  return (
    <View style={styleToUse} {...otherProps}>
      {children}
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: "2%",
    paddingBottom: "2%",
    paddingLeft: "5%",
    paddingRight: "5%",
  },
});
