import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Page } from "../shared/page";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";
import { lastActiveVibrationPattern } from "../utilities/async-storage";

export const vibrateOnCurrentDevice = ({ navigation }) => {
  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  useEffect(() => {
    let hasUnmounted = false;
    lastActiveVibrationPattern
      .read()
      .then(
        async (savedPattern) =>
          !hasUnmounted && savedPattern && setActivePattern(savedPattern)
      );
    return () => (hasUnmounted = true);
  }, []);

  useEffect(
    () => async () => {
      if (!activePattern) await lastActiveVibrationPattern.clear();
      else await lastActiveVibrationPattern.save(activePattern);
    },
    [activePattern]
  );

  return (
    <Page testID="vibrate-on-current-phone-page" style={ViewStyles.container}>
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

const ViewStyles = StyleSheet.create({
  container: {
    paddingBottom: "10%",
  },
});
