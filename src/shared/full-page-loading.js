import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { cyan } from "../utilities/colours";
import { Background } from "./background";

export const FullPageLoading = ({ testID }) => (
  <Background testID={testID} style={ViewStyles.container}>
    <ActivityIndicator testID="loadingIndicator" size={200} color={cyan} />
  </Background>
);

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
