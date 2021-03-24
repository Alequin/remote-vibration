import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Background } from "../shared/background";
import { VibrationPicker } from "../shared/vibration-picker";
import { CopyConnectionKeyButton } from "./create-a-new-connection/copy-connection-key-button";
import { useCreateConnection } from "./create-a-new-connection/use-create-connection";
import { useHasEnoughTimePassedToHideLoadingIndicator } from "./create-a-new-connection/use-has-enough-time-to-hide-loading-indicator";

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
  return (
    <>
      <CopyConnectionKeyButton connectionKey={connectionKey} />
      <VibrationPicker listHeight="30%" />
    </>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
  loadingText: {
    color: "white",
  },
});
