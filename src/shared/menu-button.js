import React from "react";
import { StyleSheet, Text } from "react-native";
import { Icon } from "./icon";
import { Button } from "./button";

export const MenuButton = ({ icon, children, ...otherProps }) => (
  <Button style={ViewStyles.menuButton} {...otherProps}>
    <Icon color="white" icon={icon} style={ViewStyles.buttonIcon} size={32} />
    <Text style={ViewStyles.menuButtonText}>{children}</Text>
  </Button>
);

const ViewStyles = StyleSheet.create({
  menuButton: {
    width: "100%",
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  menuButtonText: {
    color: "white",
    textAlign: "center",
  },
  buttonIcon: {
    textAlign: "center",
  },
});
