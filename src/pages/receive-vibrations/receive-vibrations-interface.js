import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CopyPasswordButton } from "../../shared/copy-password-button";
import { LockScreen } from "../../shared/lock-screen";
import { LockTheScreenButton } from "../../shared/lock-the-screen-button";
import { Page } from "../../shared/page";
import { StyledText } from "../../shared/styled-text";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";

export const ReceiveVibrationInterface = ({
  password,
  testID,
  currentVibrationPattern,
}) => {
  const [shouldShowLockScreen, setShouldShowLockScreen] = useState(false);

  if (shouldShowLockScreen)
    return <LockScreen onUnlock={() => setShouldShowLockScreen(false)} />;

  return (
    <Page testID={testID} style={ViewStyles.container}>
      <CopyPasswordButton label="Connected To" password={password} />
      <View style={ViewStyles.currentVibrationContainer}>
        <StyledText style={ViewStyles.currentVibrationHeader}>
          Current Vibration Pattern
        </StyledText>
        <StyledText style={ViewStyles.currentVibrationText}>
          {currentVibrationPattern ? currentVibrationPattern.name : "Nothing"}
        </StyledText>
      </View>
      <LockTheScreenButton onPress={() => setShouldShowLockScreen(true)} />
    </Page>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: "5%",
  },
  currentVibrationContainer: {
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  currentVibrationHeader: {
    fontSize: dynamicFontSize(22),
    textAlign: "center",
  },
  currentVibrationText: {
    fontSize: dynamicFontSize(24),
    textAlign: "center",
    fontWeight: "bold",
  },
});
