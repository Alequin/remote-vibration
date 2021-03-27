import Clipboard from "expo-clipboard";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Icon } from "../../shared/icon";

export const CopyConnectionKeyButton = ({ label, connectionKey }) => {
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
      <Animated.View
        style={{
          opacity: fadeAnim,
        }}
      >
        <Text style={ViewStyles.connectionKeyCopiedMessage}>Copied</Text>
      </Animated.View>
      <TouchableOpacity
        testID="copyConnectionKeyButton"
        accessibilityRole="button"
        style={ViewStyles.connectionKeyButton}
        onPress={() => {
          Clipboard.setString(connectionKey);
          fadeOut();
        }}
      >
        <Text style={ViewStyles.connectionKeyTitleText}>{label}:</Text>
        <Text style={ViewStyles.connectionKeyText}>{connectionKey}</Text>
        <Icon icon="copyToClipboard" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
};

const ViewStyles = StyleSheet.create({
  connectionKeyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingTop: 5,
  },
  connectionKeyCopiedMessage: {
    color: "cyan",
    fontSize: 14,
  },
  connectionKeyTitleText: {
    marginRight: 5,
    color: "white",
    fontSize: 20,
  },
  connectionKeyText: {
    marginRight: 5,
    color: "black",
    fontSize: 20,
    backgroundColor: "cyan",
    padding: 8,
    borderRadius: 15,
  },
});
