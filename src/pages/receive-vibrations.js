import React, { useState, useEffect } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import { Background } from "../shared/background";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { EnterKeyContainer } from "./receive-vibrations/enter-key-container";
import { FullPageLoading } from "./receive-vibrations/full-page-loading";
import { CopyConnectionKeyButton } from "./send-vibrations/copy-connection-key-button";

export const ReceiveVibrations = ({ navigation }) => {
  const [connectionKey, setConnectionKey] = useState(false);
  const [currentVibrationPattern, setCurrentVibrationPattern] = useState(false);

  const { client, isLoading, error } = useConnectToRoom(connectionKey);

  useEffect(() => {
    if (client && !isLoading) {
      client.onmessage = ({ data }) => {
        const parsedResponse = JSON.parse(data);

        if (parsedResponse.type === "receivedVibrationPattern") {
          const {
            data: { vibrationPattern, speed },
          } = parsedResponse;
          setCurrentVibrationPattern(vibrationPattern);

          if (!vibrationPattern) Vibration.cancel();
          else
            Vibration.vibrate(
              vibrationPattern.pattern.map((time) => time / speed),
              true
            );
        }
      };
    }
  }, [client, isLoading]);

  // TODO make the error handling better (error page maybe?)
  if (error) return <Text>An error occurred</Text>;

  if (!client)
    return (
      <EnterKeyContainer
        testID="receive-vibrations-page"
        onPressConnect={setConnectionKey}
      />
    );
  if (isLoading) return <FullPageLoading testID="receive-vibrations-page" />;

  return (
    <Page
      testID="receive-vibrations-page"
      connectionKey={connectionKey}
      currentVibrationPattern={currentVibrationPattern}
    />
  );
};

const Page = ({ connectionKey, testID, currentVibrationPattern }) => {
  console.log("page");
  return (
    <Background testID={testID}>
      <View>
        <CopyConnectionKeyButton
          label="Connected To"
          connectionKey={connectionKey}
        />
      </View>
      <View style={ViewStyles.currentVibrationContainer}>
        <Text style={ViewStyles.currentVibrationHeader}>
          Current Vibration Pattern
        </Text>
        <Text style={ViewStyles.currentVibrationText}>
          {currentVibrationPattern ? currentVibrationPattern.name : "Nothing"}
        </Text>
      </View>
    </Background>
  );
};

const ViewStyles = StyleSheet.create({
  currentVibrationContainer: {
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  currentVibrationHeader: {
    color: "black",
    fontSize: 22,
    textAlign: "center",
  },
  currentVibrationText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
});
