import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { mostRecentRoomKey } from "../utilities/async-storage";
import { EnterPasswordContainer } from "./receive-vibrations/enter-password-container";
import { ReceiveVibrationInterface } from "./receive-vibrations/receive-vibrations-interface";

export const ReceiveVibrations = ({ navigation }) => {
  const {
    resetClient,
    activePattern,
    password,
    setPassword,
    clearError,
    connectToRoom,
    connectToRoomError,
    shouldShowErrorPage,
    shouldShowPasswordInput,
    shouldShowLoadingIndicator,
  } = useReceiveVibrations();

  useEffect(() => {
    if (connectToRoomError)
      Alert.alert(
        "Sorry there was an issue",
        `There is no one with the password "${password}".\n\nCheck the password is correct and try again`,
        [
          {
            text: "Continue",
          },
        ],
        { cancelable: false }
      );
  }, [connectToRoomError]);

  if (shouldShowErrorPage) {
    return (
      <CannotConnectErrorPage
        onPress={() => {
          resetClient();
        }}
        buttonText="Try to Reconnect"
      />
    );
  }

  if (shouldShowPasswordInput || shouldShowLoadingIndicator)
    return (
      <EnterPasswordContainer
        testID="receive-vibrations-page"
        password={password}
        error={connectToRoomError}
        onChangeText={(newPassword) => {
          setPassword(newPassword);
          clearError();
        }}
        onPressConnect={() => connectToRoom(password)}
        shouldShowLoadingIndicator={shouldShowLoadingIndicator}
      />
    );

  return (
    <ReceiveVibrationInterface
      testID="receive-vibrations-page"
      password={password}
      currentVibrationPattern={activePattern}
    />
  );
};

const useReceiveVibrations = () => {
  const { password, setPassword } = usePassword();

  const {
    client,
    resetClient,
    isLoading,
    isConnectedToRoom,
    connectToRoomError,
    websocketError,
    clearError,
    connectToRoom,
  } = useConnectToRoom();

  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  useEffect(() => {
    client?.addOnMessageEventListener(
      "receivedVibrationPattern",
      ({ parsedData: { data } }) => {
        setActivePattern(data.vibrationPattern);
        setSpeedModifier(data.speed);
      }
    );

    return () => {
      client?.removeOnMessageEventListener("receivedVibrationPattern");
    };
  }, [client]);

  const shouldShowErrorPage =
    websocketError || connectToRoomError === "timeout";

  const shouldShowLoadingIndicator =
    !client || (!isConnectedToRoom && isLoading);

  const shouldShowPasswordInput = !isLoading && !isConnectedToRoom;

  return {
    activePattern,
    password,
    setPassword,
    clearError,
    resetClient,
    connectToRoomError,
    connectToRoom,
    shouldShowErrorPage: shouldShowErrorPage,
    shouldShowPasswordInput: shouldShowPasswordInput,
    shouldShowLoadingIndicator: shouldShowLoadingIndicator,
  };
};

const usePassword = () => {
  const [password, setPassword] = useState("");

  useEffect(() => {
    let hasUnmounted = false;
    mostRecentRoomKey
      .read()
      .then(
        (recordedKey) =>
          !hasUnmounted && !password && recordedKey && setPassword(recordedKey)
      );
    return () => (hasUnmounted = true);
  }, []);

  useEffect(() => {}, []);

  return { password, setPassword };
};
