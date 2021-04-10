import { round } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Vibration } from "react-native";
import { lastActiveVibrationPattern } from "../utilities/async-storage";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";

export const useVibration = ({ disableVibration }) => {
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
    Vibration.cancel();
    if (activeVibrationName && !disableVibration) {
      const pattern =
        activeVibrationName === RANDOM_PATTERN_NAME
          ? newRandomPattern()
          : patterns[activeVibrationName];

      startVibrating(pattern);
    }
  }, [activeVibrationName, speedModifier, disableVibration]);

  return {
    activeVibrationName,
    setActiveVibrationName,
    speedModifier,
    setSpeedModifier,
  };
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
