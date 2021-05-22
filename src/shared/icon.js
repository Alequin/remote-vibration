import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { camelCase } from "lodash";
import React from "react";
import { View } from "react-native";
import { textShadow } from "./text-shadow-style";

export const Icon = ({ icon, ...otherProps }) => {
  const IconToRender = ICON_OPTIONS[icon];
  if (!IconToRender)
    throw new Error(`Unable to find an icon by the name ${icon}`);
  return <IconToRender {...otherProps} />;
};

const customIcon =
  (IconSourceElement, iconName) =>
  ({ size, color, style, ...otherProps }) =>
    (
      <TestIdElement testID={`${camelCase(iconName)}Icon`} style={style}>
        <IconSourceElement
          name={iconName}
          size={size}
          color={color}
          style={{ ...textShadow }}
          {...otherProps}
        />
      </TestIdElement>
    );

const ICON_OPTIONS = {
  vibrate: customIcon(MaterialCommunityIcons, "vibrate"),
  link: customIcon(Entypo, "link"),
  backArrow: customIcon(Ionicons, "arrow-back-sharp"),
  backArrow2: customIcon(Ionicons, "return-up-back"),
  play: customIcon(Feather, "play"),
  checkBoxActive: customIcon(MaterialIcons, "check-box"),
  checkBoxInactive: customIcon(MaterialIcons, "check-box-outline-blank"),
  locked: customIcon(SimpleLineIcons, "lock"),
  unlocked: customIcon(SimpleLineIcons, "lock-open"),
  wifi: customIcon(FontAwesome5, "wifi"),
  connectedPeople: customIcon(MaterialIcons, "connect-without-contact"),
  copyToClipboard: customIcon(MaterialIcons, "content-copy"),
  pasteFromClipboard: customIcon(MaterialIcons, "content-paste"),
  create: customIcon(Ionicons, "create-outline"),
  cancel: customIcon(MaterialIcons, "cancel"),
  playSpeed: customIcon(MaterialCommunityIcons, "play-speed"),
  speedometerSlow: customIcon(MaterialCommunityIcons, "speedometer-slow"),
  speedometerMedium: customIcon(MaterialCommunityIcons, "speedometer-medium"),
  speedometerFast: customIcon(MaterialCommunityIcons, "speedometer"),
  blankSpace: ({ size, color, ...otherProps }) => (
    <MaterialIcons
      name="check-box-outline-blank"
      size={size}
      color="transparent"
    >
      <TestIdElement testID="blankSpaceIcon" {...otherProps} />
    </MaterialIcons>
  ),
};

const TestIdElement = (props) => <View {...props} />;
