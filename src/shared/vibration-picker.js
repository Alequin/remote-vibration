import Slider from "@react-native-community/slider";
import { round } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, Vibration } from "react-native";
import { patterns } from "../utilities/vibration-patterns";
import { borderRadius } from "./border-radius";
import { Button } from "./button";
import { PatternList } from "./pattern-list";

export const VibrationPicker = ({
  onPressLockScreen,
  onSetVibrationSpeed,
  onPickPattern,
  listHeight,
  activeVibrationName,
}) => {
  const [speedModifier, setSpeedModifier] = useState(1);

  const [
    hasSpeedModifierBeingPicked,
    setHasSpeedModifierBeingPicked,
  ] = useState(true);

  useEffect(() => {
    if (hasSpeedModifierBeingPicked && onSetVibrationSpeed) {
      onSetVibrationSpeed(speedModifier);
    }
  }, [hasSpeedModifierBeingPicked]);

  return (
    <>
      <PatternList
        listHeight={listHeight}
        patterns={Object.values(patterns)}
        activeVibrationName={activeVibrationName}
        onSelectItem={(pattern) => onPickPattern && onPickPattern(pattern)}
      />
      <Text style={ViewStyles.sliderText}>{`Speed ${speedModifier}X`}</Text>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0.1}
        value={speedModifier}
        maximumValue={4}
        onSlidingStart={() => setHasSpeedModifierBeingPicked(false)}
        onSlidingComplete={() => setHasSpeedModifierBeingPicked(true)}
        onValueChange={(value) => setSpeedModifier(round(value, 1))}
        thumbTintColor="cyan"
        minimumTrackTintColor="white"
        maximumTrackTintColor="white"
      />
      <Button onPress={onPressLockScreen} style={ViewStyles.lockButton}>
        <Text style={ViewStyles.lockButtonText}>Lock Screen</Text>
      </Button>
    </>
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

const useStartVibrating = (
  disableVibrationOnCurrentPhone,
  applySpeedModifier
) =>
  useCallback((pattern) => {
    if (!disableVibrationOnCurrentPhone)
      Vibration.vibrate(applySpeedModifier(pattern), true);
  });

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
