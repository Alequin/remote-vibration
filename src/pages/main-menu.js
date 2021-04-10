import React from "react";
import { StyleSheet } from "react-native";
import { Background } from "../shared/background";
import { MenuButton } from "../shared/menu-button";
import * as pageNames from "./page-names";

export const MainMenu = ({ navigation }) => (
  <Background style={ViewStyles.container} testID="main-menu-page">
    <MenuButton
      style={ViewStyles.middleButton}
      icon="vibrate"
      onPress={() => navigation.navigate(pageNames.vibrateOnCurrentPhone)}
    >
      {pageNames.vibrateOnCurrentPhone}
    </MenuButton>
    <MenuButton
      style={ViewStyles.middleButton}
      icon="connectedPeople"
      onPress={() => navigation.navigate(pageNames.receiveVibrations)}
    >
      {pageNames.receiveVibrations}
    </MenuButton>
    <MenuButton
      style={ViewStyles.middleButton}
      icon="wifi"
      onPress={() => navigation.navigate(pageNames.sendVibrations)}
    >
      {pageNames.sendVibrations}
    </MenuButton>
    <MenuButton style={ViewStyles.middleButton} icon="stop">
      Turn Off Ads
    </MenuButton>
  </Background>
);

const ViewStyles = StyleSheet.create({
  topButton: {
    marginBottom: 7.5,
  },
  middleButton: {
    marginTop: 7.5,
    marginBottom: 7.5,
  },
  bottomButton: {
    marginTop: 7.5,
  },
});
