import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonText } from "../shared/button";
import { LockScreen } from "../shared/lock-screen";
import { Page } from "../shared/page";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";
import { lastActiveVibrationPattern } from "../utilities/async-storage";
import { dynamicFontSize } from "../utilities/dynamic-font-size";

export const vibrateOnCurrentDevice = ({ navigation }) => {
  const [shouldShowLockScreen, setShouldShowLockScreen] = useState(false);
  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  useEffect(() => {
    let hasUnmounted = false;
    lastActiveVibrationPattern
      .read()
      .then(
        async (savedPattern) =>
          !hasUnmounted && savedPattern && setActivePattern(savedPattern)
      );
    return () => (hasUnmounted = true);
  }, []);

  useEffect(
    () => async () => {
      if (!activePattern) await lastActiveVibrationPattern.clear();
      else await lastActiveVibrationPattern.save(activePattern);
    },
    [activePattern]
  );

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
      <Button
        style={ViewStyles.lockScreenButton}
        onPress={() => setShouldShowLockScreen(true)}
      >
        <ButtonText style={ViewStyles.lockScreenButtonText}>
          Lock The Screen
        </ButtonText>
      </Button>
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
