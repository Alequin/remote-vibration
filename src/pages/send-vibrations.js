import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react/cjs/react.development";
import { Background } from "../shared/background";
import { borderRadius } from "../shared/border-radius";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useCreateRoom } from "../shared/use-create-room";
import { useVibration } from "../shared/use-vibration";
import { VibrationPicker } from "../shared/vibration-picker";
import { cyan, spaceCadet } from "../utilities/colours";
import {
  newRandomPattern,
  patterns,
  RANDOM_PATTERN_NAME,
} from "../utilities/vibration-patterns";
import { AlsoVibrateOnCurrentDeviceCheckBox } from "./send-vibrations/also-vibrate-on-current-device-check-box";
import { CopyPasswordButton } from "./send-vibrations/copy-password-button";
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
  const [isSendingVibration, setIsSendingVibration] = useState(false);
  const [
    shouldVibrateOnCurrentPhone,
    setShouldVibrateOnCurrentPhone,
  ] = useState(false);

  const {
    activePattern,
    setActivePattern,
    speedModifier,
    setSpeedModifier,
  } = useVibration({
    disableVibration: !shouldVibrateOnCurrentPhone,
  });

  useEffect(() => {
    let isSendingVibrationTimeout = null;
    client.addOnMessageEventListener(
      "confirmVibrationPatternSent",
      () =>
        // delay so the message does not flash on the screen too quickly
        (isSendingVibrationTimeout = setTimeout(
          () => setIsSendingVibration(false),
          250
        ))
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
          vibrationPattern: vibrationPatternToSend(activePattern),
          speed: speedModifier,
        },
      })
    );
  }, [activePattern, speedModifier]);

  const sendingMessageStyle = useMemo(
    () => ({
      ...ViewStyles.sendingTextContainer,
      opacity: activePattern && isSendingVibration ? 1 : 0,
    }),
    [activePattern, isSendingVibration]
  );

  return (
    <>
      <CopyPasswordButton label="Password" connectionKey={connectionKey} />
      <VibrationPicker
        listHeight="100%"
        activeVibrationName={activePattern?.name}
        onChangeVibrationSpeed={setSpeedModifier}
        onPickPattern={(pattern) => {
          setIsSendingVibration(true);

          if (activePattern?.name === pattern.name) {
            setActivePattern(null);
            return;
          }

          setActivePattern(pattern);
        }}
      />
      <AlsoVibrateOnCurrentDeviceCheckBox
        isActive={shouldVibrateOnCurrentPhone}
        onPress={() =>
          setShouldVibrateOnCurrentPhone(!shouldVibrateOnCurrentPhone)
        }
      />
      <View style={sendingMessageStyle}>
        <Text style={ViewStyles.sendingText}>
          Sending "{activePattern?.name}" to others
        </Text>
        <ActivityIndicator testID="loadingIndicator" size={20} color={cyan} />
      </View>
    </>
  );
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
