import React, { useContext, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import { AppContext } from "../../app-context";
import { Background } from "../shared/background";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useCreateRoom } from "../shared/use-create-room";
import { VibrationPicker } from "../shared/vibration-picker";
import { cyan } from "../utilities/colours";
import {
  newRandomPattern,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { CopyConnectionKeyButton } from "./send-vibrations/copy-connection-key-button";
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
            color={cyan}
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
  const { isAppActive } = useContext(AppContext);
  const [isSendingVibration, setIsSendingVibration] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [vibrationSpeed, setVibrationSpeed] = useState(1);

  useEffect(() => {
    let isSendingVibrationTimeout = null;
    client.addOnMessageEventListener(
      "confirmVibrationPatternSent",
      ({ parsedData }) => {
        if (parsedData.type === "confirmVibrationPatternSent")
          // delay so the message does not flash on the screen to quickly
          isSendingVibrationTimeout = setTimeout(
            () => setIsSendingVibration(false),
            250
          );
      }
    );

    return () => {
      clearTimeout(isSendingVibrationTimeout);
      client.removeOnMessageEventListener("confirmVibrationPatternSent");
    };
  }, [client]);

  useEffect(() => {
    client.send(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: vibrationPatternToSend(selectedPattern),
          speed: vibrationSpeed,
        },
      })
    );
  }, [selectedPattern, vibrationSpeed]);

  const currentPatterName = selectedPattern && selectedPattern.name;

  const sendingMessageStyle = useMemo(
    () => ({
      ...ViewStyles.sendingTextContainer,
      opacity: selectedPattern && isSendingVibration ? 1 : 0,
    }),
    [selectedPattern, isSendingVibration]
  );

  return (
    <>
      <CopyConnectionKeyButton
        label="Connection Key"
        connectionKey={connectionKey}
      />
      <VibrationPicker
        listHeight="100%"
        activeVibrationName={currentPatterName}
        onChangeVibrationSpeed={setVibrationSpeed}
        onPickPattern={(pattern) => {
          setIsSendingVibration(true);
          setSelectedPattern(vibrationPatternToSet(pattern, selectedPattern));
        }}
      />
      <View style={sendingMessageStyle}>
        <Text style={ViewStyles.sendingText}>
          Sending "{currentPatterName}" to others
        </Text>
        <ActivityIndicator testID="loadingIndicator" size={20} color={cyan} />
      </View>
    </>
  );
};

const vibrationPatternToSet = (pattern, currentPattern) => {
  const shouldSendStopVibratingMessage =
    currentPattern && currentPattern.name === pattern.name;
  return !shouldSendStopVibratingMessage ? pattern : null;
};

const vibrationPatternToSend = (selectedPattern) => {
  if (!selectedPattern) return null;
  return selectedPattern.name === RANDOM_PATTERN_NAME
    ? newRandomPattern()
    : selectedPattern;
};

const ViewStyles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
  loadingText: {
    color: "black",
  },
  sendingTextContainer: {
    flexDirection: "row",
    margin: 20,
  },
  sendingText: {
    color: "black",
    paddingRight: 10,
    fontSize: 18,
  },
});
