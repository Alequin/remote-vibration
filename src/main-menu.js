import React from "react";
import { useMemo } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { Background } from "./background";
import { Icon } from "./icon";
import * as pages from "./pages";

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

const MenuButton = (props) => {
  const buttonStyle = useMemo(() => {
    if (props.isTop) return ViewStyles.topMenuButton;
    if (props.isBottom) return ViewStyles.bottomMenuButton;
    return ViewStyles.menuButton;
  }, [props.isTop, props.isBottom]);

  return (
    <View style={buttonStyle} accessibilityRole="button">
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
