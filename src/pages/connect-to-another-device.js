import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Background } from "../shared/background";
import * as pageNames from "./page-names";
import { MenuButton } from "../shared/menu-button";

export const ConnectToAnotherDevice = ({ navigation }) => (
  <Background
    style={ViewStyles.container}
    testID="connect-to-another-device-page"
  >
    <MenuButton isTop icon="connectedPeople">
      {pageNames.connectToSomeoneElse}
    </MenuButton>
    <MenuButton
      isBottom
      icon="link"
      onPress={() => navigation.navigate(pageNames.createAConnection)}
    >
      {pageNames.createAConnection}
    </MenuButton>
  </Background>
);

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
});
