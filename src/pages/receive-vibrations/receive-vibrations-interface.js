import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CopyPasswordButton } from "../../shared/copy-password-button";
import { Page } from "../../shared/page";

export const ReceiveVibrationInterface = ({
  connectionKey,
  testID,
  currentVibrationPattern,
}) => {
  return (
    <Page testID={testID} style={ViewStyles.container}>
      <View>
        <CopyPasswordButton
          label="Connected To"
          connectionKey={connectionKey}
        />
      </View>
      <View style={ViewStyles.currentVibrationContainer}>
        <Text style={ViewStyles.currentVibrationHeader}>
          Current Vibration Pattern
        </Text>
        <Text style={ViewStyles.currentVibrationText}>
          {currentVibrationPattern ? currentVibrationPattern.name : "Nothing"}
        </Text>
      </View>
    </Page>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  currentVibrationContainer: {
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  currentVibrationHeader: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
  },
  currentVibrationText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
});
