import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Button, ButtonText } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { textShadow } from "../../shared/text-shadow-style";
import { spaceCadet } from "../../utilities/colours";

export const MenuButton = ({ icon, children, ...otherProps }) => {
  return (
    <Button style={ViewStyles.menuButton} {...otherProps}>
      <Icon style={ViewStyles.buttonIcon} color="white" icon={icon} size={30} />
      <ButtonText style={ViewStyles.buttonText}>{children}</ButtonText>
    </Button>
  );
};

const ViewStyles = StyleSheet.create({
  menuButton: {
    margin: "5%",
    padding: 10,
    borderRadius: 20,
    width: "80%",
    backgroundColor: spaceCadet,
    flexDirection: "row",
  },
  buttonIcon: {
    flex: 2,
    alignItems: "center",
  },
  buttonText: {
    flex: 8,
    alignItems: "center",
    ...textShadow,
  },
});
