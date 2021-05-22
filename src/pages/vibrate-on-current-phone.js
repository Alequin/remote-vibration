import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { LockScreen } from "../shared/lock-screen";
import { LockTheScreenButton } from "../shared/lock-the-screen-button";
import { Page } from "../shared/page";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";
import { dynamicFontSize } from "../utilities/dynamic-font-size";

export const vibrateOnCurrentDevice = ({ navigation }) => {
  const [shouldShowLockScreen, setShouldShowLockScreen] = useState(false);
  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  if (shouldShowLockScreen)
    return <LockScreen onUnlock={() => setShouldShowLockScreen(false)} />;

  return (
    <Page testID="vibrate-on-current-phone-page" style={ViewStyles.container}>
      <VibrationPicker
        listHeight="90%"
        activeVibrationName={activePattern?.name}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activePattern?.name === pattern.name) {
            setActivePattern(null);
            return;
          }

          setActivePattern(pattern);
        }}
      />
      <LockTheScreenButton onPress={() => setShouldShowLockScreen(true)} />
    </Page>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
  lockScreenButton: {
    margin: "2%",
    marginTop: "4%",
  },
  lockScreenButtonText: {
    fontSize: dynamicFontSize(16),
  },
});
