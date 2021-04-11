import React, { useEffect, useState } from "react";
import { CannotConnectErrorPage } from "../shared/cannot-connect-error-page";
import { FullPageLoading } from "../shared/full-page-loading";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { mostRecentRoomKey } from "../utilities/async-storage";
import * as pageNames from "./page-names";
import { EnterPasswordContainer } from "./receive-vibrations/enter-password-container";
import { ReceivePage } from "./receive-vibrations/receive-page";

export const ReceiveVibrations = ({ navigation }) => {
  const { password, setPassword } = usePassword();

  const {
    client,
    isLoading,
    isConnected,
    error,
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

  if (websocketError) {
    return (
      <CannotConnectErrorPage
        onPress={() => navigation.navigate(pageNames.mainMenu)}
      />
    );
  }

  if (!isLoading && (!isConnected || error))
    return (
      <EnterPasswordContainer
        testID="receive-vibrations-page"
        password={password}
        error={error}
        onChangeText={(newPassword) => {
          setPassword(newPassword);
          clearError();
        }}
        onPressConnect={() => connectToRoom(password)}
      />
    );

  if (!isConnected && isLoading)
    return <FullPageLoading testID="receive-vibrations-page" />;

  return (
    <ReceivePage
      testID="receive-vibrations-page"
      connectionKey={password}
      currentVibrationPattern={activePattern}
    />
  );
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
