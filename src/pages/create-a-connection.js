import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Dimensions, Text } from "react-native";
import { Background } from "../shared/background";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { AppContext } from "../../app-context";

const websocketServer = `ws://remote-vibration-server.herokuapp.com/`;

export const createAConnection = ({ navigation }) => {
  const { connection, isLoading } = useWebsocketClient();

  if (isLoading) return <Text>Loading</Text>;

  return (
    <Background style={ViewStyles.container} testID="create-a-connection-page">
      <Text style={{ color: "white" }}>Done</Text>
    </Background>
  );
};

const useWebsocketClient = () => {
  const { deviceId } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    fetch("http://remote-vibration-server.herokuapp.com/room", {
      method: "POST",
      headers: { deviceId },
    })
      .then((response) => response.json())
      .then(({ roomKey }) => roomKey);

    return () => client.close();
  }, []);

  return { connection, isLoading };
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: Dimensions.get("window").height * 0.15,
  },
});
