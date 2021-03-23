import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import { Background } from "../shared/background";
import { useCreateConnection } from "./create-a-new-connection/use-create-connection";

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
        <Page connectionKey={connectionKey} client={client}></Page>
      )}
    </Background>
  );
};

const useHasEnoughTimePassedToHideLoadingIndicator = () => {
  const [canHideIndicator, setCanHideIndicator] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCanHideIndicator(true);
    }, 750);
    return () => clearInterval(timeout);
  }, []);

  return canHideIndicator;
};

const Page = ({ connectionKey, client }) => {
  return (
    <Text style={{ color: "white" }}>Connection Key: {connectionKey}</Text>
  );
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
  loadingText: {
    color: "white",
  },
});
