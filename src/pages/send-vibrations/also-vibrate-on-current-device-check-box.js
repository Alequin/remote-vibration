import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { textShadow } from "../../shared/text-shadow-style";
import { StyledText } from "../../shared/styled-text";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";

export const AlsoVibrateOnCurrentDeviceCheckBox = ({ isActive, onPress }) => (
  <Button style={ViewStyles.container} onPress={onPress}>
    <View style={ViewStyles.wrapper}>
      <StyledText style={ViewStyles.text}>
        Also vibrate on this device
      </StyledText>
      <Icon
        icon={isActive ? "checkBoxActive" : "checkBoxInactive"}
        color="white"
        size={30}
      />
    </View>
  </Button>
);

const ViewStyles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  text: {
    color: "white",
    fontSize: dynamicFontSize(18),
    ...textShadow,
  },
});
