import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Dimensions, Text } from "react-native";
import { Background } from "../shared/background";
import { AppContext } from "../../app-context";
import fetch from "node-fetch";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

export const createAConnection = ({ navigation }) => {
  const { client, connectionKey, isLoading, error } = useCreateConnection();

  return (
    <Background style={ViewStyles.container} testID="create-a-connection-page">
      {isLoading || error ? (
        <Text>Loading {JSON.stringify(error)}</Text>
      ) : (
        <Text style={{ color: "white" }}>Connection Key: {connectionKey}</Text>
      )}
    </Background>
  );
};

const useCreateConnection = () => {
  const { deviceId } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [connectionKey, setConnectionKey] = useState(null);

  useEffect(() => {
    const client = establishWebsocketConnection();
    fetch("http://remote-vibration-server.herokuapp.com/room", {
      method: "POST",
      headers: { deviceId },
    })
      .then(async (response) => {
        const { roomKey } = await response.json();

        client.onopen = () => {
          client.send(
            JSON.stringify({
              type: "connectToRoom",
              data: { roomKey: roomKey },
            })
          );

          setClient(client);
          setConnectionKey(roomKey);
        };
      })
      .catch((error) => setError(error));

    return () => client.close();
  }, []);

  return { client, connectionKey, isLoading: !client || !connectionKey, error };
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
});
