import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "./icon";
import { Button, ButtonText } from "./button";

export const MenuButton = ({ icon, children, ...otherProps }) => (
  <Button style={ViewStyles.menuButton} {...otherProps}>
    <View style={ViewStyles.innerButton}>
      <Icon color="white" icon={icon} style={ViewStyles.buttonIcon} size={32} />
      <ButtonText>{children}</ButtonText>
    </View>
  </Button>
);

const ViewStyles = StyleSheet.create({
  menuButton: {
    width: "100%",
    flex: 1,
    marginTop: 7.5,
    marginBottom: 7.5,
  },
  innerButton: {
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
  },
  buttonIcon: {
    textAlign: "center",
    marginBottom: "3%",
  },
});
