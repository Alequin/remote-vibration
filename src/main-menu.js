import React from "react";
import { useMemo } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon } from "./icon";

export const MainMenu = () => {
  return (
    <View style={ViewStyles.container}>
      <MenuButton isTop icon="vibrate">
        Make This Phone Vibrate
      </MenuButton>
      <MenuButton icon="createNewItem">Create Vibration Pattern</MenuButton>
      <MenuButton icon="vibrate">Connect To Another Device</MenuButton>
      <MenuButton isBottom icon="stop">
        Turn Off Ads
      </MenuButton>
    </View>
  );
};

const MenuButton = (props) => {
  const buttonStyle = useMemo(() => {
    if (props.isTop) return ViewStyles.topMenuButton;
    if (props.isBottom) return ViewStyles.bottomMenuButton;
    return ViewStyles.menuButton;
  }, [props.isTop, props.isBottom]);

  return (
    <View style={buttonStyle}>
      <TouchableOpacity {...props}>
        <Icon
          color="white"
          icon={props.icon}
          style={ViewStyles.buttonIcon}
          size={32}
        />
        <Text style={ViewStyles.menuButtonText}>{props.children}</Text>
      </TouchableOpacity>
    </View>
  );
};

const baseMenuButton = {
  width: "80%",
  backgroundColor: "transparent",
  borderColor: "white",
  borderWidth: 1,
  paddingTop: 30,
  paddingBottom: 30,
  paddingLeft: 10,
  paddingRight: 10,
};

const ViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    paddingTop: Dimensions.get("window").height * 0.15,
  },
  topMenuButton: {
    ...baseMenuButton,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  menuButton: baseMenuButton,
  bottomMenuButton: {
    ...baseMenuButton,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  menuButtonText: {
    width: "100%",
    backgroundColor: "transparent",
    color: "white",
    textAlign: "center",
  },
  buttonIcon: {
    textAlign: "center",
  },
});
