import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Background } from "../shared/background";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { mostRecentRoomKey } from "../utilities/async-storage";
import { EnterPasswordContainer } from "./receive-vibrations/enter-password-container";
import { FullPageLoading } from "./receive-vibrations/full-page-loading";
import { CopyPasswordButton } from "./send-vibrations/copy-password-button";

export const ReceiveVibrations = ({ navigation }) => {
  const { password, setPassword } = usePassword();

  const {
    client,
    isLoading,
    isConnected,
    error,
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
    <Page
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

const Page = ({ connectionKey, testID, currentVibrationPattern }) => {
  return (
    <Background testID={testID}>
      <View>
        <CopyPasswordButton
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
