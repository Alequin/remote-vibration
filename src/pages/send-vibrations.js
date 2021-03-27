import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import { Background } from "../shared/background";
import { VibrationPicker } from "../shared/vibration-picker";
import { CopyConnectionKeyButton } from "./send-vibrations/copy-connection-key-button";
import { useCreateRoom } from "../shared/use-create-room";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useHasEnoughTimePassedToHideLoadingIndicator } from "./send-vibrations/use-has-enough-time-to-hide-loading-indicator";

export const SendVibrations = ({ navigation }) => {
  // Add in false loading time to stop screen flashing the loading spinner
  // if the connection is create really fast
  const canHideIndicator = useHasEnoughTimePassedToHideLoadingIndicator();

  const {
    connectionKey,
    isLoading: isStillCreatingRoom,
    error: createRoomError,
  } = useCreateRoom();
  const {
    client,
    isLoading: isStillConnectingToRoom,
    error: connectToRoomError,
  } = useConnectToRoom(connectionKey);

  const isLoading = isStillCreatingRoom || isStillConnectingToRoom;

  // TODO make the error handling better (error page maybe?)
  if (createRoomError) return <Text>An error occurred</Text>;
  if (connectToRoomError) return <Text>An error occurred</Text>;

  return (
    <Background style={ViewStyles.container} testID="send-vibrations-page">
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
  const [isSendingVibration, setIsSendingVibration] = useState(false);
  const [selectedPatternName, setSelectedPatternName] = useState(null);
  const [vibrationSpeed, setVibrationSpeed] = useState(1);

  useEffect(() => {
    client.onmessage = ({ data }) => {
      const parsedResponse = JSON.parse(data);
      if (parsedResponse.type === "confirmVibrationPatternSent")
        setIsSendingVibration(false);
    };
  }, [setIsSendingVibration]);

  return (
    <>
      <CopyConnectionKeyButton
        label="Connection Key"
        connectionKey={connectionKey}
      />
      <VibrationPicker
        listHeight="30%"
        activeVibrationName={selectedPatternName}
        onChangeVibrationSpeed={setVibrationSpeed}
        onPickPattern={(pattern) => {
          const patternToSet = !selectedPatternName ? pattern : null;

          client.send(
            JSON.stringify({
              type: "sendVibrationPattern",
              data: {
                vibrationPattern: patternToSet,
                speed: vibrationSpeed,
              },
            })
          );
          setIsSendingVibration(true);
          setSelectedPatternName(patternToSet && patternToSet.name);
        }}
      />
      {selectedPatternName && isSendingVibration && (
        <View style={ViewStyles.sendingTextContainer}>
          <Text style={ViewStyles.sendingText}>
            Sending "{selectedPatternName}" to others
          </Text>
          <ActivityIndicator
            testID="loadingIndicator"
            size={20}
            color="white"
          />
        </View>
      )}
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
  sendingTextContainer: {
    paddingTop: 20,
    flexDirection: "row",
  },
  sendingText: {
    color: "white",
    paddingRight: 10,
  },
});
