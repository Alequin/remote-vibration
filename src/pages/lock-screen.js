import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { Icon } from "../shared/icon";
import { preventDefaultEvent } from "../utilities/prevent-default-event";
const MAX_SLIDER_VALUE = 100;

export const LockScreen = ({
  onUnlock,
  navigation,
  currentVibrationPatternName,
}) => {
  const [resetSliderTimeout, setResetSliderTimeout] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);

  useDisableNavigationBar(navigation);
  useDisableBackButtons();

  const isSliderAtMax = sliderValue >= MAX_SLIDER_VALUE;

  useEffect(() => {
    const unlockTimeout = isSliderAtMax && setTimeout(onUnlock, 500);
    return () => clearTimeout(unlockTimeout);
  }, [isSliderAtMax]);

  useEffect(() => () => clearTimeout(resetSliderTimeout), []);

  const iconToShow = isSliderAtMax ? "unlocked" : "locked";

  // TODO improve on using a slide as you don't need to drag the slider
  return (
    <Background style={ViewStyles.container}>
      <Text style={ViewStyles.sliderText}>
        Vibration Pattern: {currentVibrationPatternName || "Nothing"}
      </Text>
      <Icon icon={iconToShow} size={300} color="white"></Icon>
      <Text style={ViewStyles.sliderText}>Drag to 100% to unlock</Text>
      <Text style={ViewStyles.sliderText}>{sliderValue}%</Text>

      <Slider
        testID="speed-slider"
        tapToSeek={false}
        style={ViewStyles.slider}
        minimumValue={0}
        value={sliderValue}
        maximumValue={MAX_SLIDER_VALUE}
        onValueChange={(value) => {
          setSliderValue(Math.round(value));
        }}
        onSlidingComplete={(value) => {
          if (value < MAX_SLIDER_VALUE)
            setResetSliderTimeout(setTimeout(() => setSliderValue(0), 250));
        }}
        thumbTintColor="cyan"
        minimumTrackTintColor="white"
        maximumTrackTintColor="white"
      />
    </Background>
  );
};

const useDisableNavigationBar = (navigation) =>
  useEffect(() => {
    navigation.addListener("beforeRemove", preventDefaultEvent);
    return () => navigation.removeListener("beforeRemove");
  }, []);

const useDisableBackButtons = () =>
  useEffect(() => {
    const disablingBackHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      returnTrue // Disable back buttons
    );
    // Enable back buttons
    return () => disablingBackHandler.remove();
  }, []);

export const returnTrue = () => true;

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    color: "white",
    fontSize: 20,
    marginTop: 20,
    textAlign: "center",
  },
  slider: {
    marginTop: 10,
    width: "90%",
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
