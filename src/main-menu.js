import React from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import { Background } from "./shared/background";
import { Icon } from "./shared/icon";
import * as pages from "./shared/pages";
import { Button } from "./shared/button";

export const MainMenu = ({ navigation }) => (
  <Background style={ViewStyles.container}>
    <MenuButton
      isTop
      icon="vibrate"
      onPress={() => navigation.navigate(pages.localVibration)}
    >
      Vibrate On Current Phone
    </MenuButton>
    <MenuButton icon="link">Connect To Another Device</MenuButton>
    <MenuButton isBottom icon="stop">
      Turn Off Ads
    </MenuButton>
  </Background>
);

const MenuButton = ({ icon, children, ...otherProps }) => (
  <Button style={ViewStyles.menuButton} {...otherProps}>
    <Icon color="white" icon={icon} style={ViewStyles.buttonIcon} size={32} />
    <Text style={ViewStyles.menuButtonText}>{children}</Text>
  </Button>
);

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
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
