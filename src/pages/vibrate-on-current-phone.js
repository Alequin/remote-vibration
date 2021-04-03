import { round } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Vibration } from "react-native";
import { Background } from "../shared/background";
import { VibrationPicker } from "../shared/vibration-picker";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const [
    activeVibrationName,
    setNameOfCurrentlyPlayingExampleVibration,
  ] = useState(null);

  const {
    speedModifier,
    setSpeedModifier,
    applySpeedModifier,
  } = useSpeedModifier();

  const startVibrating = useStartVibrating(applySpeedModifier);

  useEffect(() => {
    if (activeVibrationName) {
      const pattern =
        activeVibrationName === RANDOM_PATTERN_NAME
          ? newRandomPattern()
          : patterns[activeVibrationName];

      startVibrating(pattern);
    }
  }, [speedModifier]);

  return (
    <Background testID="vibrate-on-current-phone-page">
      <VibrationPicker
        listHeight="90%"
        activeVibrationName={activeVibrationName}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activeVibrationName === pattern.name) {
            Vibration.cancel();
            setNameOfCurrentlyPlayingExampleVibration(null);
            return;
          }

          const patternToUse =
            pattern.name === RANDOM_PATTERN_NAME ? newRandomPattern() : pattern;

          startVibrating(patternToUse);
          setNameOfCurrentlyPlayingExampleVibration(pattern.name);
        }}
      />
    </Background>
  );
};

const useSpeedModifier = () => {
  const [speedModifier, setSpeedModifier] = useState(1);

  const applySpeedModifier = useCallback(
    ({ pattern }) => pattern.map((time) => time / speedModifier),
    [speedModifier]
  );

  return {
    speedModifier,
    setSpeedModifier: useCallback((value) => {
      setSpeedModifier(round(value, 1));
    }),
    applySpeedModifier,
  };
};

const useStartVibrating = (applySpeedModifier) =>
  useCallback((pattern) =>
    Vibration.vibrate(applySpeedModifier(pattern), true)
  );

const ViewStyles = StyleSheet.create({});
