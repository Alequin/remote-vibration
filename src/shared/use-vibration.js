import { round } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import { Vibration } from "react-native";
import { AppContext } from "../../app-context";
import {
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { lastActiveVibrationPattern } from "../utilities/async-storage";

export const useVibration = ({ disableVibration }) => {
  const { isAppActive } = useContext(AppContext);
  const [activePattern, setActivePattern] = useState(null);

  const {
    speedModifier,
    setSpeedModifier,
    applySpeedModifier,
  } = useSpeedModifier();

  useEffect(() => {
    Vibration.cancel();
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
