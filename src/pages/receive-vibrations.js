import React, { useState, useEffect } from "react";
import { StyleSheet, Text, Vibration } from "react-native";
import { Background } from "../shared/background";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { EnterKeyContainer } from "./receive-vibrations/enter-key-container";
import { FullPageLoading } from "./receive-vibrations/full-page-loading";

export const ReceiveVibrations = ({ navigation }) => {
  const [connectionKey, setConnectionKey] = useState(false);

  const { client, isLoading, error } = useConnectToRoom(connectionKey);

  useEffect(() => {
    if (client && !isLoading) {
      client.onmessage = ({ data }) => {
        const parsedResponse = JSON.parse(data);

        if (parsedResponse.type === "receivedVibrationPattern") {
          const { data } = parsedResponse;

          if (!data.vibrationPattern) Vibration.cancel();
          else Vibration.vibrate(data.vibrationPattern.pattern, true);
        }
      };
    }
  }, [client, isLoading]);

  // TODO make the error handling better (error page maybe?)
  if (error) return <Text>An error occurred</Text>;

  if (!client) return <EnterKeyContainer onPressConnect={setConnectionKey} />;
  if (isLoading) return <FullPageLoading />;

  return <Page />;
};

const Page = () => {
  return (
    <Background>
      <Text style={{ color: "white" }}>Connected</Text>
    </Background>
  );
};

const ViewStyles = StyleSheet.create({});
