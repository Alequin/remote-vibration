import React, { useState, useEffect } from "react";
import { StyleSheet, Text, Vibration, View } from "react-native";
import { Background } from "../shared/background";
import { useConnectToRoom } from "../shared/use-connect-to-room";
import { useVibration } from "../shared/use-vibration";
import { EnterPasswordContainer } from "./receive-vibrations/enter-password-container";
import { FullPageLoading } from "./receive-vibrations/full-page-loading";
import { CopyPasswordButton } from "./send-vibrations/copy-password-button";

export const ReceiveVibrations = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const { activePattern, setActivePattern, setSpeedModifier } = useVibration({
    disableVibration: false,
  });

  const { client, isLoading, error } = useConnectToRoom(password);

  useEffect(() => {
    if (client && !isLoading) {
      client.addOnMessageEventListener(
        "receivedVibrationPattern",
        ({ parsedData: { data } }) => {
          setActivePattern(data.vibrationPattern);
          setSpeedModifier(data.speed);
        }
      );
    }

    return () => {
      client?.removeOnMessageEventListener("receivedVibrationPattern");
    };
  }, [client, isLoading]);

  // TODO make the error handling better (error page maybe?)
  if (error) return <Text>An error occurred</Text>;

  if (!client)
    return (
      <EnterPasswordContainer
        testID="receive-vibrations-page"
        onPressConnect={setPassword}
      />
    );
  if (isLoading) return <FullPageLoading testID="receive-vibrations-page" />;

  return (
    <Page
      testID="receive-vibrations-page"
      connectionKey={password}
      currentVibrationPattern={activePattern}
    />
  );
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
