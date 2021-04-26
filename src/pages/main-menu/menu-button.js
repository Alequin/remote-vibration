import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Icon } from "../../shared/icon";
import { Button, ButtonText } from "../../shared/button";
import { useMemo } from "react";
import { spaceCadet } from "../../utilities/colours";
import { textShadow } from "../../shared/text-shadow-style";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";

const windowHeight = Dimensions.get("window").height;

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
    height: windowHeight * 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    backgroundColor: spaceCadet,
    width: windowHeight * 0.18,
    height: windowHeight * 0.18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    marginBottom: windowHeight * 0.01,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: dynamicFontSize(19),
    ...textShadow,
  },
});
