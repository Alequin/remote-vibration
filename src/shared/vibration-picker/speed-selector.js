import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { cyan } from "../../utilities/colours";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";
import {
  isSmallScreen,
  isSmallScreenHeight,
} from "../../utilities/is-small-screen";
import { Icon } from "../icon";
import { textShadow } from "../text-shadow-style";

export const SpeedSelector = ({
  speedModifier,
  onSlidingStart,
  onSlidingComplete,
  onValueChange,
}) => {
  const sliderText = `Speed ${speedModifier.toFixed(1)}X`;

  return (
    <View style={ViewStyles.speedSelectorContainer}>
      <View style={ViewStyles.sliderTextContainer}>
        <Icon icon={pickSpeedIcon(speedModifier)} color="white" size={28} />
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
    paddingTop: 10,
  },
  sliderText: {
    color: "white",
    fontSize: dynamicFontSize(20),
    textAlign: "center",
    flexDirection: "row",
    marginLeft: 5,
    ...textShadow,
  },
  slider: {
    marginTop: isSmallScreenHeight() ? 0 : 10,
    width: "100%",
  },
  speedSelectorContainer: {
    width: "100%",
  },
});
