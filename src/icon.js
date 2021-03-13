import React from "react";
import { MaterialCommunityIcons, Ionicons, Entypo } from "@expo/vector-icons";

export const Icon = ({ icon, ...otherProps }) => {
  const IconToRender = ICON_OPTIONS[icon];
  if (!IconToRender)
    throw new Error(`Unable to find an icon by the name ${icon}`);
  return <IconToRender {...otherProps} />;
};
const ICON_OPTIONS = {
  stop: (props) => <MaterialCommunityIcons name="cancel" {...props} />,
  vibrate: (props) => <MaterialCommunityIcons name="vibrate" {...props} />,
  createNewItem: (props) => <Ionicons name="create-outline" {...props} />,
  link: (props) => <Entypo name="link" {...props} />,
};
