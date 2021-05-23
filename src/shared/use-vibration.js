import round from "lodash/round";
import { useCallback, useEffect, useState } from "react";
import { Vibration } from "react-native";
import {
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";

export const useVibration = ({ disableVibration }) => {
  const [activePattern, setActivePattern] = useState(null);

  const { speedModifier, setSpeedModifier, applySpeedModifier } =
    useSpeedModifier();

  useEffect(
    () => () => {
      deactivateKeepAwake();
      Vibration.cancel();
    },
    []
  );

  useEffect(() => {
    deactivateKeepAwake();
    Vibration.cancel();

    if (activePattern) activateKeepAwake();
    if (activePattern && !disableVibration) {
      const pattern =
        activePattern?.name === RANDOM_PATTERN_NAME
          ? newRandomPattern()
          : activePattern;

      Vibration.vibrate(applySpeedModifier(pattern), true);
    }
  }, [activePattern, speedModifier, disableVibration]);

  return {
    activePattern,
    setActivePattern,
    speedModifier,
    setSpeedModifier,
  };
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
