import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "./icon";
import { Button, ButtonText } from "./button";
import { useMemo } from "react";

export const MenuButton = ({ icon, children, style, ...otherProps }) => {
  const buttonStyle = useMemo(() => ({ ...ViewStyles.menuButton, ...style }), [
    style,
  ]);

  return (
    <Button style={buttonStyle} {...otherProps}>
      <View style={ViewStyles.innerButton}>
        <Icon
          color="white"
          icon={icon}
          style={ViewStyles.buttonIcon}
          size={32}
        />
        <ButtonText>{children}</ButtonText>
      </View>
    </Button>
  );
};

const ViewStyles = StyleSheet.create({
  menuButton: {
    width: "100%",
    flex: 1,
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
