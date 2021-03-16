import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CheckBox } from "./check-box";

export const CheckBoxWithText = ({
  isActive,
  onStatusChange,
  color,
  size,
  textStyle,
  containerStyle,
  children,
}) => {
  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={ViewStyles.button}
        onPress={() => onStatusChange(!isActive)}
      >
        <Text style={textStyle}>{children}</Text>
        <CheckBox isActive={isActive} color={color} size={size} />
      </TouchableOpacity>
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
