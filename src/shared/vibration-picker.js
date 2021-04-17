import Slider from "@react-native-community/slider";
import { round } from "lodash";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { cyan } from "../utilities/colours";
import { patterns } from "../utilities/vibration-patterns";
import { borderRadius } from "./border-radius";
import { Icon } from "./icon";
import { PatternList } from "./pattern-list";
import { textShadow } from "./text-shadow-style";

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
  const sliderText = `Speed ${speedModifier.toFixed(1)}X`;

  return (
    <View style={ViewStyles.speedSelectorContainer}>
      <View style={ViewStyles.sliderTextContainer}>
        <Icon icon={pickSpeedIcon(speedModifier)} color="white" size={32} />
        <Text style={ViewStyles.sliderText}>{sliderText}</Text>
      </View>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0.1}
        value={speedModifier}
        maximumValue={3}
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

const pickSpeedIcon = (speed) => {
  if (speed < 1) return "speedometerSlow";
  if (speed >= 2) return "speedometerFast";
  return "speedometerMedium";
};

const ViewStyles = StyleSheet.create({
  sliderTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderText: {
    color: "white",
    fontSize: 21,
    textAlign: "center",
    flexDirection: "row",
    marginLeft: 5,
    ...textShadow,
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
    borderRadius,
    padding: 20,
  },
});
