import React from "react";
import { StyleSheet } from "react-native";
import { Background } from "../shared/background";
import { MenuButton } from "../shared/menu-button";
import * as pageNames from "./page-names";

export const MainMenu = ({ navigation }) => (
  <Background testID="main-menu-page">
    <MenuButton
      style={ViewStyles.button}
      icon="vibrate"
      onPress={() => navigation.navigate(pageNames.vibrateOnCurrentPhone)}
    >
      {pageNames.vibrateOnCurrentPhone}
    </MenuButton>
    <MenuButton
      style={ViewStyles.button}
      icon="connectedPeople"
      onPress={() => navigation.navigate(pageNames.receiveVibrations)}
    >
      {pageNames.receiveVibrations}
    </MenuButton>
    <MenuButton
      style={ViewStyles.button}
      icon="wifi"
      onPress={() => navigation.navigate(pageNames.sendVibrations)}
    >
      {pageNames.sendVibrations}
    </MenuButton>
  </Background>
);

const ViewStyles = StyleSheet.create({
  button: {
    marginVertical: 15,
  },
});
