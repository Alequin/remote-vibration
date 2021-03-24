import { round } from "lodash";
import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { VibrationPicker } from "../shared/vibration-picker";
import { LockScreen } from "./lock-screen";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const [
    nameOfCurrentlyPlayingExampleVibration,
    setNameOfCurrentlyPlayingExampleVibration,
  ] = useState(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  return isScreenLocked ? (
    <LockScreen
      onUnlock={() => setIsScreenLocked(false)}
      navigation={navigation}
      currentVibrationPatternName={nameOfCurrentlyPlayingExampleVibration}
    />
  ) : (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <VibrationPicker
        onPressLockScreen={() => setIsScreenLocked(true)}
        onPickPattern={({ name }) =>
          setNameOfCurrentlyPlayingExampleVibration(name)
        }
      />
    </Background>
  );
};

const useSpeedModifier = () => {
  const [speedModifier, setSpeedModifier] = useState(1);

  const applySpeedModifier = useCallback(
    ({ pattern }) => {
      return pattern.map((time) => time * speedModifier);
    },
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
