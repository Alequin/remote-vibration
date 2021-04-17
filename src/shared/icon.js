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

export const Icon = ({ icon, ...otherProps }) => {
  const IconToRender = ICON_OPTIONS[icon];
  if (!IconToRender)
    throw new Error(`Unable to find an icon by the name ${icon}`);
  return <IconToRender {...otherProps} />;
};

const customIcon = (IconSourceElement, iconName) => ({
  size,
  color,
  style,
  ...otherProps
}) => (
  <TestIdElement testID={`${camelCase(iconName)}Icon`} style={style}>
    <IconSourceElement
      name={iconName}
      size={size}
      color={color}
      {...otherProps}
    />
  </TestIdElement>
);

const ICON_OPTIONS = {
  vibrate: customIcon(MaterialCommunityIcons, "vibrate"),
  link: customIcon(Entypo, "link"),
  backArrow: customIcon(Ionicons, "arrow-back-sharp"),
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
