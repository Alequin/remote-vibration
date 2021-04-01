import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import React from "react";
import { Text } from "react-native";

export const Icon = ({ icon, ...otherProps }) => {
  const IconToRender = ICON_OPTIONS[icon];
  if (!IconToRender)
    throw new Error(`Unable to find an icon by the name ${icon}`);
  return <IconToRender {...otherProps} />;
};
const ICON_OPTIONS = {
  stop: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="stopIcon" {...otherProps}>
      <MaterialCommunityIcons name="cancel" size={size} color={color} />
    </TestWrapper>
  ),
  vibrate: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="vibrateIcon" {...otherProps}>
      <MaterialCommunityIcons name="vibrate" size={size} color={color} />
    </TestWrapper>
  ),
  link: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="linkIcon" {...otherProps}>
      <Entypo name="link" size={size} color={color} />
    </TestWrapper>
  ),
  backArrow: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="backArrowIcon" {...otherProps}>
      <Ionicons name="arrow-back-sharp" size={size} color={color} />
    </TestWrapper>
  ),
  play: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="playIcon" {...otherProps}>
      <Feather name="play" size={size} color={color} />
    </TestWrapper>
  ),
  checkBoxActive: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="checkBoxActiveIcon" {...otherProps}>
      <MaterialIcons name="check-box" size={size} color={color} />
    </TestWrapper>
  ),
  checkBoxInactive: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="checkBoxInactiveIcon" {...otherProps}>
      <MaterialIcons name="check-box-outline-blank" size={size} color={color} />
    </TestWrapper>
  ),
  locked: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="lockedIcon" {...otherProps}>
      <SimpleLineIcons name="lock" size={size} color={color} />
    </TestWrapper>
  ),
  unlocked: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="unlockedIcon" {...otherProps}>
      <SimpleLineIcons name="lock-open" size={size} color={color} />
    </TestWrapper>
  ),
  wifi: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="wifiIcon" {...otherProps}>
      <FontAwesome5 name="wifi" size={size} color={color} />
    </TestWrapper>
  ),
  connectedPeople: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="connectedPeopleIcon" {...otherProps}>
      <MaterialIcons name="connect-without-contact" size={size} color={color} />
    </TestWrapper>
  ),
  copyToClipboard: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="connectedPeopleIcon" {...otherProps}>
      <MaterialIcons name="content-copy" size={size} color={color} />
    </TestWrapper>
  ),
  create: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="createIcon" {...otherProps}>
      <Ionicons name="create-outline" size={size} color={color} />
    </TestWrapper>
  ),
  cancel: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="cancelIcon" {...otherProps}>
      <MaterialIcons name="cancel" size={size} color={color} />
    </TestWrapper>
  ),
  blankSpace: ({ size, color, ...otherProps }) => (
    <TestWrapper testID="blankSpaceIcon" {...otherProps}>
      <MaterialIcons
        name="check-box-outline-blank"
        size={size}
        color="transparent"
      />
    </TestWrapper>
  ),
};

const TestWrapper = (props) => <Text {...props} />;
