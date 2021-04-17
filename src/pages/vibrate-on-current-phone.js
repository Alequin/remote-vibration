import React, { useEffect } from "react";
import { Page } from "../shared/page";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";
import { lastActiveVibrationPattern } from "../utilities/async-storage";

export const VibrateOnCurrentPhone = ({ navigation }) => {
  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  useEffect(() => {
    lastActiveVibrationPattern
      .read()
      .then(
        async (savedPattern) => savedPattern && setActivePattern(savedPattern)
      );
  }, []);

  useEffect(
    () => async () => {
      if (!activePattern) await lastActiveVibrationPattern.clear();
      else await lastActiveVibrationPattern.save(activePattern);
    },
    [activePattern]
  );

  return (
    <Page testID="vibrate-on-current-phone-page">
      <VibrationPicker
        listHeight="90%"
        activeVibrationName={activePattern?.name}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          if (activePattern?.name === pattern.name) {
            setActivePattern(null);
            return;
          }

          setActivePattern(pattern);
        }}
      />
    </Page>
  );
};
