import * as Clipboard from "expo-clipboard";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { darkCyan, spaceCadet } from "../utilities/colours";
import { dynamicFontSize } from "../utilities/dynamic-font-size";
import { Icon } from "./icon";
import { StyledText } from "./styled-text";

export const CopyPasswordButton = ({ label, password }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeOut = () => {
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  };
  return (
    <>
      <TouchableOpacity
        testID="copyPasswordButton"
        accessibilityRole="button"
        style={ViewStyles.passwordButton}
        onPress={async () => {
          await Clipboard.setStringAsync(password);
          fadeOut();
        }}
      >
        <StyledText style={ViewStyles.passwordTitleText}>{label}:</StyledText>
        <Text style={ViewStyles.passwordText}>{password.toLowerCase()}</Text>
        <Icon icon="copyToClipboard" size={24} color="white" />
      </TouchableOpacity>
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
      >
        <Text style={ViewStyles.passwordCopiedMessage}>Copied</Text>
      </Animated.View>
    </>
  );
};

const ViewStyles = StyleSheet.create({
  passwordButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: "15%",
  },
  passwordCopiedMessage: {
    color: spaceCadet,
    fontSize: 14,
  },
  passwordTitleText: {
    marginRight: 5,
    fontSize: dynamicFontSize(20),
  },
  passwordText: {
    marginRight: 5,
    color: darkCyan,
    fontSize: dynamicFontSize(20),
    backgroundColor: spaceCadet,
    padding: 8,
    borderRadius: 15,
    fontWeight: "bold",
  },
});
