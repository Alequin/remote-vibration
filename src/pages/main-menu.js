import React from "react";
import { StyleSheet } from "react-native";
import { MenuButton } from "./main-menu/menu-button";
import { Page } from "../shared/page";
import * as pageNames from "./page-names";

export const MainMenu = ({ navigation }) => (
  <Page testID="main-menu-page" style={ViewStyles.container}>
    <MenuButton
      style={ViewStyles.button}
      icon="vibrate"
      onPress={() => navigation.navigate(pageNames.vibrateOnCurrentDevice)}
    >
      {pageNames.vibrateOnCurrentDevice}
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
  </Page>
);

const ViewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  button: {
    margin: "5%",
  },
});
