import Slider from "@react-native-community/slider";
import { round } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, Vibration } from "react-native";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { borderRadius } from "./border-radius";
import { Button } from "./button";
import { PatternList } from "./pattern-list";

export const VibrationPicker = ({ onPressLockScreen, onPickPattern }) => {
  const [
    nameOfCurrentlyPlayingExampleVibration,
    setNameOfCurrentlyPlayingExampleVibration,
  ] = useState(null);

  const [
    hasSpeedModifierBeingPicked,
    setHasSpeedModifierBeingPicked,
  ] = useState(true);
  const {
    speedModifier,
    setSpeedModifier,
    applySpeedModifier,
  } = useSpeedModifier();

  useEffect(() => {
    if (nameOfCurrentlyPlayingExampleVibration && hasSpeedModifierBeingPicked) {
      const pattern =
        nameOfCurrentlyPlayingExampleVibration === RANDOM_PATTERN_NAME
          ? newRandomPattern()
          : patterns[nameOfCurrentlyPlayingExampleVibration];

      Vibration.vibrate(applySpeedModifier(pattern), true);
    }
  }, [speedModifier, hasSpeedModifierBeingPicked]);

  return (
    <>
      <PatternList
        patterns={Object.values(patterns)}
        applySpeedModifier={applySpeedModifier}
        nameOfCurrentlyPlayingExampleVibration={
          nameOfCurrentlyPlayingExampleVibration
        }
        onSelectItem={(pattern) => {
          if (nameOfCurrentlyPlayingExampleVibration === pattern.name) {
            Vibration.cancel();
            setNameOfCurrentlyPlayingExampleVibration(null);
            return;
          }

          onPickPattern(pattern);
          setNameOfCurrentlyPlayingExampleVibration(pattern.name);

          const patternToUse =
            pattern.name !== RANDOM_PATTERN_NAME ? pattern : newRandomPattern();

          Vibration.vibrate(applySpeedModifier(patternToUse), true);
        }}
      />
      <Text style={ViewStyles.sliderText}>{`Speed ${speedModifier}X`}</Text>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0.1}
        value={speedModifier}
        maximumValue={2}
        onSlidingStart={() => setHasSpeedModifierBeingPicked(false)}
        onSlidingComplete={() => setHasSpeedModifierBeingPicked(true)}
        onValueChange={(value) => setSpeedModifier(value)}
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
