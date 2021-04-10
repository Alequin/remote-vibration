import React from "react";
import { Vibration } from "react-native";
import { Background } from "../shared/background";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const {
    activeVibrationName,
    setActiveVibrationName,
    setSpeedModifier,
  } = useVibration({ disableVibration: false });

  return (
    <Background testID="vibrate-on-current-phone-page">
      <VibrationPicker
        listHeight="90%"
        activeVibrationName={activeVibrationName}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activeVibrationName === pattern.name) {
            setActiveVibrationName(null);
            return;
          }

          setActiveVibrationName(pattern.name);
        }}
      />
    </Background>
  );
};
