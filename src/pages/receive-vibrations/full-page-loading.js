import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Background } from "../../shared/background";

export const FullPageLoading = () => (
  <Background testID="receive-vibrations-page" style={ViewStyles.container}>
    <ActivityIndicator testID="loadingIndicator" size={100} color="white" />
  </Background>
);

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
