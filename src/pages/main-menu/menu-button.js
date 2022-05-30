import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ButtonText } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { textShadow } from "../../shared/text-shadow-style";
import { spaceCadet } from "../../utilities/colours";

export const MenuButton = ({ icon, children, ...otherProps }) => {
  return (
    <Button style={ViewStyles.menuButton} {...otherProps}>
      <Icon style={ViewStyles.buttonIcon} color="white" icon={icon} size={30} />
      <View style={{ flex: 8, justifyContent: "center" }}>
        <ButtonText style={textShadow}>{children}</ButtonText>
      </View>
    </Button>
  );
};

const ViewStyles = StyleSheet.create({
  menuButton: {
    margin: "2%",
    padding: 10,
    height: 70,
    borderRadius: 20,
    width: "80%",
    backgroundColor: spaceCadet,
    flexDirection: "row",
  },
  buttonIcon: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
