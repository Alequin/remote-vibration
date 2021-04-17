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
        onPress={() => navigation.navigate(pageNames.mainMenu)}
      />
    );
  }

  if (shouldShowPasswordInput)
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
      />
    );

  if (shouldShowLoadingIndicator)
    return <FullPageLoading testID="receive-vibrations-page" />;

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
    isLoading,
    isConnected,
    error: connectToRoomError,
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

  const shouldShowErrorPage = websocketError;

  const shouldShowPasswordInput =
    !isLoading && (!isConnected || connectToRoomError);

  const shouldShowLoadingIndicator = !isConnected && isLoading;

  return {
    activePattern,
    password,
    setPassword,
    clearError,
    connectToRoomError,
    connectToRoom,
    shouldShowErrorPage: shouldShowErrorPage,
    shouldShowPasswordInput: !shouldShowErrorPage && shouldShowPasswordInput,
    shouldShowLoadingIndicator:
      !shouldShowErrorPage &&
      !shouldShowPasswordInput &&
      shouldShowLoadingIndicator,
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
