import { round } from "lodash";
import React, { useCallback, useState, useEffect } from "react";
import { StyleSheet, Vibration } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { VibrationPicker } from "../shared/vibration-picker";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { LockScreen } from "./lock-screen";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const [
    activeVibrationName,
    setNameOfCurrentlyPlayingExampleVibration,
  ] = useState(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

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

  return isScreenLocked ? (
    <LockScreen
      onUnlock={() => setIsScreenLocked(false)}
      navigation={navigation}
      currentVibrationPatternName={activeVibrationName}
    />
  ) : (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <VibrationPicker
        listHeight="60%"
        activeVibrationName={activeVibrationName}
        onPressLockScreen={() => setIsScreenLocked(true)}
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

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: "2%",
  },
  sliderText: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
    textAlign: "center",
  },
  slider: {
    marginTop: 10,
    width: "100%",
  },
  lockButton: {
    borderRadius,
    width: "100%",
    padding: 20,
    marginTop: 20,
  },
  lockButtonText: {
    textAlign: "center",
    color: "white",
  },
});
