import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text } from "react-native";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { Icon } from "../shared/icon";
import { preventDefaultEvent } from "../utilities/prevent-default-event";
const MAX_SLIDER_VALUE = 1;

export const LockScreen = ({ onUnlock, navigation }) => {
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

  return (
    <Background style={ViewStyles.container}>
      <Icon icon={iconToShow} size={300} color="white"></Icon>
      <Text style={ViewStyles.sliderText}>
        Drag the slider from left to right to unlock
      </Text>
      <Slider
        testID="speed-slider"
        style={ViewStyles.slider}
        minimumValue={0}
        value={sliderValue}
        maximumValue={MAX_SLIDER_VALUE}
        onValueChange={(value) => console.log(value) || setSliderValue(value)}
        onSlidingComplete={() =>
          setResetSliderTimeout(setTimeout(() => setSliderValue(0), 500))
        }
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
