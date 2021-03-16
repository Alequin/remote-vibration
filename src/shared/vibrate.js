import { sum } from "lodash";
import { Vibration } from "react-native";

const newVibrationManager = () => {
  let isVibrating = false;
  let timeout = null;

  return {
    start: (pattern, isRepeatTurnedOn) => {
      const totalRuntime = sum(pattern);
      isVibrating = true;

      Vibration.vibrate(pattern, isRepeatTurnedOn);
      timeout = setTimeout(() => (isVibrating = false), totalRuntime);
    },
    isVibrating: () => isVibrating,
    stop: () => {
      clearTimeout(timeout);
      isVibrating = false;
      Vibration.cancel();
    },
  };
};

export const vibrate = newVibrationManager();
