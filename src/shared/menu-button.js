import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "./icon";
import { Button, ButtonText } from "./button";
import { useMemo } from "react";
import { spaceCadet } from "../utilities/colours";

export const MenuButton = ({ icon, children, style, ...otherProps }) => {
  const buttonStyle = useMemo(() => ({ ...ViewStyles.menuButton, ...style }), [
    style,
  ]);

  return (
    <Button style={buttonStyle} {...otherProps}>
      <Icon style={ViewStyles.buttonIcon} color="white" icon={icon} size={50} />
      <ButtonText style={ViewStyles.buttonText}>{children}</ButtonText>
    </Button>
  );
};

const ViewStyles = StyleSheet.create({
  menuButton: {
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    backgroundColor: spaceCadet,
    width: 125,
    height: 125,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    marginBottom: "5%",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 19,
    textShadowColor: "black",
    textShadowRadius: 4,
  },
});
