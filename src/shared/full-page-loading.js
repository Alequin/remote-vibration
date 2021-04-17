import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { cyan } from "../utilities/colours";
import { Page } from "./page";

export const FullPageLoading = ({ testID }) => (
  <Page testID={testID} style={ViewStyles.container}>
    <ActivityIndicator testID="loadingIndicator" size={200} color={cyan} />
  </Page>
);

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
