import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Background } from "./background";

export const localVibration = () => {
  return (
    <Background style={ViewStyles.container}>
      <Text>local vibration</Text>
    </Background>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
});
