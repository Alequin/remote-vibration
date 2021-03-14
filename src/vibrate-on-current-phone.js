import React from "react";
import { StyleSheet, View, Dimensions, Text } from "react-native";
import { Background } from "./shared/background";
import { borderRadius } from "./shared/border-radius";
import { Button } from "./shared/button";

export const VibrateOnCurrentPhone = () => {
  return (
    <Background
      style={ViewStyles.container}
      testID="vibrate-on-current-phone-page"
    >
      <View style={ViewStyles.sequenceList}></View>
      <Button isTop style={ViewStyles.button}>
        <Text style={ViewStyles.buttonText}> Add Vibration Pattern</Text>
      </Button>
      <Button isBottom style={ViewStyles.button}>
        <Text style={ViewStyles.buttonText}>Save List As New Pattern</Text>
      </Button>
    </Background>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: "2%",
  },
  sequenceList: {
    width: "100%",
    height: "65%",
    borderColor: "white",
    borderRadius: borderRadius,
    borderWidth: 1,
    marginBottom: "4%",
  },
  button: {
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    padding: 17.5,
  },
});
