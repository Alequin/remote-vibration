import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { spaceCadet } from "../../utilities/colours";

export const AlsoVibrateOnCurrentDeviceCheckBox = ({ isActive, onPress }) => {
  return (
    <Button style={ViewStyles.container} onPress={onPress}>
      <View style={ViewStyles.wrapper}>
        <Text style={ViewStyles.text}>Also vibrate on this device</Text>
        <Icon
          icon={isActive ? "checkBoxActive" : "checkBoxInactive"}
          color="white"
          size={24}
        />
      </View>
    </Button>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    borderRadius,
    backgroundColor: spaceCadet,
    width: "100%",
    marginHorizontal: 20,
    marginTop: 5,
    padding: 10,
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  text: {
    color: "white",
    fontSize: 18,
  },
});
