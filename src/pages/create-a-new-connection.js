import React, { useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Background } from "../shared/background";
import { Icon } from "../shared/icon";
import { useCreateConnection } from "./create-a-new-connection/use-create-connection";
import { useHasEnoughTimePassedToHideLoadingIndicator } from "./create-a-new-connection/use-has-enough-time-to-hide-loading-indicator";
import Clipboard from "expo-clipboard";

export const createANewConnection = ({ navigation }) => {
  // Add in false loading time to stop screen flashing the loading spinner
  // if the connection is create really fast
  const canHideIndicator = useHasEnoughTimePassedToHideLoadingIndicator();

  const { client, connectionKey, isLoading, error } = useCreateConnection();

  // TODO make the error handling better (error page maybe?)
  if (error) return <Text>An error occurred</Text>;

  return (
    <Background style={ViewStyles.container} testID="create-a-connection-page">
      {isLoading || !canHideIndicator ? (
        <>
          <ActivityIndicator
            testID="loadingIndicator"
            size={100}
            color="white"
          />
          <Text style={ViewStyles.loadingText}>Setting up connection</Text>
        </>
      ) : (
        <Page connectionKey={connectionKey} client={client} />
      )}
    </Background>
  );
};

const Page = ({ connectionKey, client }) => {
  return <CopyConnectionKeyButton connectionKey={connectionKey} />;
};

const CopyConnectionKeyButton = ({ connectionKey }) => {
  // fadeAnim will be used as the value for opacity. Initial Value: 0
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };
  return (
    <>
      <Animated.View
        style={{
          opacity: fadeAnim, // Bind opacity to animated value
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
        <Text style={ViewStyles.connectionKeyTitleText}>Connection Key:</Text>
        <Text style={ViewStyles.connectionKeyText}>{connectionKey}</Text>
        <Icon icon="copyToClipboard" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
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
  loadingText: {
    color: "white",
  },
});
