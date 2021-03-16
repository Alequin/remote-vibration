import React from "react";
import {
  MaterialCommunityIcons,
  Ionicons,
  Entypo,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
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
};

const TestWrapper = (props) => <Text {...props} />;
