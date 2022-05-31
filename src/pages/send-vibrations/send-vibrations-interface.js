import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { CopyPasswordButton } from "../../shared/copy-password-button";
import { Page } from "../../shared/page";
import { useVibration } from "../../shared/use-vibration";
import { VibrationPicker } from "../../shared/vibration-picker";
import {
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../../utilities/vibration-patterns";
import { AlsoVibrateOnCurrentDeviceCheckBox } from "./also-vibrate-on-current-device-check-box";

export const SendVibrationsInterface = ({ password, client, testID }) => {
  const [shouldVibrateOnCurrentDevice, setShouldVibrateOnCurrentDevice] =
    useState(false);

  const [hasFirstPatternBeingPicked, setHasFirstPatternBeingPicked] =
    useState(false);

  const { activePattern, setActivePattern, speedModifier, setSpeedModifier } =
    useVibration({
      disableVibration: !shouldVibrateOnCurrentDevice,
    });

  useEffect(() => {
    if (hasFirstPatternBeingPicked) {
      client.send(
        JSON.stringify({
          type: "sendVibrationPattern",
          data: {
            vibrationPattern: vibrationPatternToSend(activePattern),
            speed: speedModifier,
          },
        })
      );
    }
  }, [hasFirstPatternBeingPicked, activePattern, speedModifier]);

  return (
    <Page style={ViewStyles.container} testID={testID}>
      <CopyPasswordButton label="Password" password={password} />
      <VibrationPicker
        listHeight="100%"
        activeVibrationName={activePattern?.name}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activePattern?.name === pattern.name) {
            setActivePattern(null);
            return;
          }

          setActivePattern(pattern);
          if (!hasFirstPatternBeingPicked) setHasFirstPatternBeingPicked(true);
        }}
      />
      <AlsoVibrateOnCurrentDeviceCheckBox
        isActive={shouldVibrateOnCurrentDevice}
        onPress={() =>
          setShouldVibrateOnCurrentDevice(!shouldVibrateOnCurrentDevice)
        }
      />
    </Page>
  );
};

const vibrationPatternToSend = (selectedPattern) => {
  if (!selectedPattern) return null;
  return selectedPattern.name === RANDOM_PATTERN_NAME
    ? newRandomPattern()
    : selectedPattern;
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: 10,
    alignItems: "center",
  },
});
