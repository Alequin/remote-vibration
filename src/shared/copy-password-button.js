import Clipboard from "expo-clipboard";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { darkCyan, spaceCadet } from "../utilities/colours";
import { dynamicFontSize } from "../utilities/dynamic-font-size";
import { Icon } from "./icon";
import { StyledText } from "./styled-text";

export const CopyPasswordButton = ({ label, connectionKey }) => {
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
        testID="copyConnectionKeyButton"
        accessibilityRole="button"
        style={ViewStyles.connectionKeyButton}
        onPress={() => {
          Clipboard.setString(connectionKey);
          fadeOut();
        }}
      >
        <StyledText style={ViewStyles.connectionKeyTitleText}>
          {label}:
        </StyledText>
        <Text style={ViewStyles.connectionKeyText}>{connectionKey}</Text>
        <Icon icon="copyToClipboard" size={24} color="white" />
      </TouchableOpacity>
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
      >
        <Text style={ViewStyles.connectionKeyCopiedMessage}>Copied</Text>
      </Animated.View>
    </>
  );
};

const ViewStyles = StyleSheet.create({
  connectionKeyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5,
  },
  connectionKeyCopiedMessage: {
    color: spaceCadet,
    fontSize: 14,
  },
  connectionKeyTitleText: {
    marginRight: 5,
    fontSize: dynamicFontSize(20),
  },
  connectionKeyText: {
    marginRight: 5,
    color: darkCyan,
    fontSize: dynamicFontSize(20),
    backgroundColor: spaceCadet,
    padding: 8,
    borderRadius: 15,
    fontWeight: "bold",
  },
});
