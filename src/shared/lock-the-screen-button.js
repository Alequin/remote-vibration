import React from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonText } from "../shared/button";
import { dynamicFontSize } from "../utilities/dynamic-font-size";

export const LockTheScreenButton = ({ onPress }) => (
  <Button style={ViewStyles.lockScreenButton} onPress={onPress}>
    <ButtonText style={ViewStyles.lockScreenButtonText}>
      Lock The Screen
    </ButtonText>
  </Button>
);

const ViewStyles = StyleSheet.create({
  lockScreenButton: {
    width: "100%",
    padding: "2%",
    marginTop: "4%",
  },
  lockScreenButtonText: {
    fontSize: dynamicFontSize(16),
  },
});
