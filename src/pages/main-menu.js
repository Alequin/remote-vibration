import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { MenuButton } from "./main-menu/menu-button";
import { Page } from "../shared/page";
import * as pageNames from "./page-names";
import { isSmallScreenHeight } from "../utilities/is-small-screen";

export const MainMenu = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    return () =>
      navigation.setOptions({
        headerShown: true,
      });
  });

  return (
    <Page testID="main-menu-page" style={ViewStyles.container}>
      <MenuButton
        icon="vibrate"
        onPress={() => navigation.navigate(pageNames.vibrateOnCurrentDevice)}
      >
        {pageNames.vibrateOnCurrentDevice}
      </MenuButton>
      <MenuButton
        icon="connectedPeople"
        onPress={() => navigation.navigate(pageNames.receiveVibrations)}
      >
        {pageNames.receiveVibrations}
      </MenuButton>
      <MenuButton
        icon="wifi"
        onPress={() => navigation.navigate(pageNames.sendVibrations)}
      >
        {pageNames.sendVibrations}
      </MenuButton>
    </Page>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "1%",
    height: "70%",
  },
});
