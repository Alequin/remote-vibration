import React from "react";
import { StyleSheet } from "react-native";
import { Background } from "../shared/background";
import { MenuButton } from "../shared/menu-button";
import * as pageNames from "./page-names";

export const MainMenu = ({ navigation }) => (
  <Background style={ViewStyles.container} testID="main-menu-page">
    <MenuButton
      icon="vibrate"
      onPress={() => navigation.navigate(pageNames.vibrateOnCurrentPhone)}
    >
      {pageNames.vibrateOnCurrentPhone}
    </MenuButton>
    <MenuButton
      icon="connectedPeople"
      onPress={() => navigation.navigate(pageNames.receiveVibrations)}
    >
      {pageNames.receiveVibrations}
    </MenuButton>
    <MenuButton
      icon="link"
      onPress={() => navigation.navigate(pageNames.sendVibrations)}
    >
      {pageNames.sendVibrations}
    </MenuButton>
    <MenuButton
      icon="create"
      onPress={() => navigation.navigate(pageNames.sendVibrations)}
    >
      {pageNames.createACustomPattern}
    </MenuButton>
    <MenuButton icon="stop">Turn Off Ads</MenuButton>
  </Background>
);

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: "15%",
    paddingBottom: "5%",
  },
});
