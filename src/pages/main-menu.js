import React from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import { Background } from "../shared/background";
import * as pageNames from "./page-names";
import { MenuButton } from "../shared/menu-button";

export const MainMenu = ({ navigation }) => (
  <Background style={ViewStyles.container} testID="main-menu-page">
    <MenuButton
      isTop
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
    <MenuButton isBottom icon="stop">
      Turn Off Ads
    </MenuButton>
  </Background>
);

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
});
