import React, { useEffect, useState } from "react";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { FullPageLoading } from "../shared/full-page-loading";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { mostRecentRoomKey } from "../utilities/async-storage";
import * as pageNames from "./page-names";
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

  if (shouldShowErrorPage) {
    return (
      <CannotConnectErrorPage
        onPress={resetClient}
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
      connectionKey={password}
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
    isConnected,
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

  const shouldShowLoadingIndicator = !client || (!isConnected && isLoading);

  const shouldShowPasswordInput = !isLoading && !isConnected;

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
    mostRecentRoomKey
      .read()
      .then(
        (recordedKey) => !password && recordedKey && setPassword(recordedKey)
      );
  }, []);

  return { password, setPassword };
};
