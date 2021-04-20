import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import { CopyPasswordButton } from "../../shared/copy-password-button";
import { Page } from "../../shared/page";
import { StyledText } from "../../shared/styled-text";
import { useVibration } from "../../shared/use-vibration";
import { VibrationPicker } from "../../shared/vibration-picker";
import { cyan } from "../../utilities/colours";
import {
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../../utilities/vibration-patterns";
import { AlsoVibrateOnCurrentDeviceCheckBox } from "./also-vibrate-on-current-device-check-box";

export const SendVibrationsInterface = ({ connectionKey, client, testID }) => {
  const [isSendingVibration, setIsSendingVibration] = useState(false);
  const [
    shouldVibrateOnCurrentDevice,
    setShouldVibrateOnCurrentDevice,
  ] = useState(false);

  const {
    activePattern,
    setActivePattern,
    speedModifier,
    setSpeedModifier,
  } = useVibration({
    disableVibration: !shouldVibrateOnCurrentDevice,
  });

  useEffect(() => {
    let isSendingVibrationTimeout = null;
    client.addOnMessageEventListener(
      "confirmVibrationPatternSent",
      () =>
        // delay so the message does not flash on the screen too quickly
        (isSendingVibrationTimeout = setTimeout(
          () => setIsSendingVibration(false),
          250
        ))
    );

    return () => {
      clearTimeout(isSendingVibrationTimeout);
      client.removeOnMessageEventListener("confirmVibrationPatternSent");
    };
  }, [client]);

  useEffect(() => {
    client.send(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: vibrationPatternToSend(activePattern),
          speed: speedModifier,
        },
      })
    );
  }, [activePattern, speedModifier]);

  return (
    <Page style={ViewStyles.container} testID={testID}>
      <CopyPasswordButton label="Password" connectionKey={connectionKey} />
      <VibrationPicker
        listHeight="100%"
        activeVibrationName={activePattern?.name}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          setIsSendingVibration(true);

          if (activePattern?.name === pattern.name) {
            setActivePattern(null);
            return;
          }

          setActivePattern(pattern);
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
    paddingBottom: 20,
    alignItems: "center",
  },
  sendingText: {
    paddingRight: 10,
    fontSize: 18,
  },
});
