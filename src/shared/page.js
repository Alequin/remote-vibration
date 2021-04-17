import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

export const Page = ({ testID, style, children }) => (
  <View style={usePageStyles(style)} testID={testID}>
    {children}
  </View>
);

const usePageStyles = (style = {}) =>
  useMemo(
    () => ({
      ...ViewStyles.page,
      ...style,
    }),
    [style]
  );

const ViewStyles = StyleSheet.create({
  page: { height: "100%", width: "100%" },
});
