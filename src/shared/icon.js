import React from "react";
import { MaterialCommunityIcons, Ionicons, Entypo } from "@expo/vector-icons";
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
};

const TestWrapper = (props) => <Text {...props} />;
