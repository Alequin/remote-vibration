import { round } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Vibration } from "react-native";
import { Background } from "../shared/background";
import { VibrationPicker } from "../shared/vibration-picker";
import { lastActiveVibrationPattern } from "../utilities/async-storage";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const {
    activeVibrationName,
    setActiveVibrationName,
  } = useActiveVibrationName();

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
  }, [activeVibrationName, speedModifier]);

  return (
    <Background testID="vibrate-on-current-phone-page">
      <VibrationPicker
        listHeight="90%"
        activeVibrationName={activeVibrationName}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activeVibrationName === pattern.name) {
            Vibration.cancel();
            setActiveVibrationName(null);
            return;
          }

          setActiveVibrationName(pattern.name);
        }}
      />
    </Background>
  );
};

const useActiveVibrationName = () => {
  const [activeVibrationName, setActiveVibrationName] = useState(null);

  useEffect(() => {
    lastActiveVibrationPattern
      .read()
      .then(async (name) => name && setActiveVibrationName(name));
  }, []);

  useEffect(
    () => async () => {
      if (!activeVibrationName) await lastActiveVibrationPattern.clear();
      else await lastActiveVibrationPattern.save(activeVibrationName);
    },
    [activeVibrationName]
  );

  return { activeVibrationName, setActiveVibrationName };
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
