import Slider from "@react-native-community/slider";
import { round } from "lodash";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { cyan, spaceCadet } from "../utilities/colours";
import { patterns } from "../utilities/vibration-patterns";
import { borderRadius } from "./border-radius";
import { PatternList } from "./pattern-list";

export const VibrationPicker = ({
  onChangeVibrationSpeed,
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
    if (hasSpeedModifierBeingPicked && onChangeVibrationSpeed) {
      onChangeVibrationSpeed(speedModifier);
    }
  }, [hasSpeedModifierBeingPicked, speedModifier]);

  return (
    <>
      <PatternList
        listHeight={listHeight}
        patterns={Object.values(patterns)}
        activeVibrationName={activeVibrationName}
        onSelectItem={(pattern) => onPickPattern && onPickPattern(pattern)}
      />
      <SpeedSelector
        speedModifier={speedModifier}
        onSlidingStart={() => setHasSpeedModifierBeingPicked(false)}
        onSlidingComplete={() => setHasSpeedModifierBeingPicked(true)}
        onValueChange={(value) => setSpeedModifier(round(value, 1))}
      />
    </>
  );
};

const SpeedSelector = ({
  speedModifier,
  onSlidingStart,
  onSlidingComplete,
  onValueChange,
}) => {
  return (
    <View style={ViewStyles.speedSelectorContainer}>
      <Text style={ViewStyles.sliderText}>{`Speed ${speedModifier}X`}</Text>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0.1}
        value={speedModifier}
        maximumValue={4}
        thumbTintColor={cyan}
        minimumTrackTintColor="white"
        maximumTrackTintColor="white"
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
        onValueChange={onValueChange}
      />
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: "2%",
  },
  sliderText: {
    color: "white",
    fontSize: 20,
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

  speedSelectorContainer: {
    width: "100%",
    backgroundColor: spaceCadet,
    borderRadius,
    padding: 20,
  },
});
