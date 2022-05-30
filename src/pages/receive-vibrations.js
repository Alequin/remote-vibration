import { isNull } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { useWebsocketConnection } from "../shared/use-websocket-connection";
import { mostRecentRoomKey } from "../utilities/async-storage";
import { badPasswordAlert } from "./receive-vibrations/bad-password-alert";
import { EnterPasswordContainer } from "./receive-vibrations/enter-password-container";
import { ReceiveVibrationInterface } from "./receive-vibrations/receive-vibrations-interface";

export const ReceiveVibrations = ({ navigation }) => {
  const {
    resetClient,
    activePattern,
    password,
    setPassword,
    clearPassword,
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
          if (isNull(newPassword)) clearPassword();

          setPassword(newPassword || "");
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
  const { password, setPassword, clearPassword } = usePassword();

  const { client, resetClient, websocketError } = useWebsocketConnection();
  const {
    isLoading,
    isConnectedToRoom,
    connectToRoomError,
    clearError,
    connectToRoom,
  } = useConnectToRoom(client);

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

  const shouldShowBadPasswordAlert =
    connectToRoomError === "password does not exist";

  useEffect(() => {
    if (shouldShowBadPasswordAlert) {
      badPasswordAlert({ password, onClose: clearError });
    }
  }, [shouldShowBadPasswordAlert, password, clearError]);

  const shouldShowErrorPage = Boolean(
    !shouldShowBadPasswordAlert && (websocketError || connectToRoomError)
  );

  const shouldShowLoadingIndicator =
    !client || (!isConnectedToRoom && isLoading);

  const shouldShowPasswordInput = !isLoading && !isConnectedToRoom;

  return {
    activePattern,
    password,
    setPassword,
    clearPassword,
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

  const clearPassword = useCallback(async () => mostRecentRoomKey.clear(), []);

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

  return { password, setPassword, clearPassword };
};
