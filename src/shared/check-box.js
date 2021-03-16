import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Icon } from "../shared/icon";

export const CheckBox = ({ isActive, ...otherProps }) => {
  return (
    <TouchableOpacity>
      <Icon
        icon={isActive ? "checkBoxActive" : "checkBoxInactive"}
        {...otherProps}
      ></Icon>
    </TouchableOpacity>
  );
};
