import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Background } from "../../shared/background";
import { CopyPasswordButton } from "../../shared/copy-password-button";

export const ReceivePage = ({
  connectionKey,
  testID,
  currentVibrationPattern,
}) => {
  return (
    <Background testID={testID}>
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
    </Background>
  );
};

const ViewStyles = StyleSheet.create({
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
