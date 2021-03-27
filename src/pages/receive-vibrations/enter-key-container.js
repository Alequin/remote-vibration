import { isEmpty } from "lodash";
import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Background } from "../../shared/background";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { mostRecentRoomKey } from "../../utilities/async-storage";

export const EnterKeyContainer = ({ onPressConnect }) => {
  const { key, setKey } = useKey();

  const isButtonDisabled = isEmpty(key);

  const buttonTextStyle = useMemo(() => {
    return {
      ...ViewStyles.connectButtonText,
      opacity: isButtonDisabled ? 0.4 : 1,
    };
  }, [isButtonDisabled]);

  return (
    <Background testID="receive-vibrations-page">
      <View style={ViewStyles.keyInputContainer}>
        <Text style={ViewStyles.keyText}>
          Enter the other persons connection key
        </Text>
        <TextInput
          value={key}
          onChangeText={setKey}
          style={ViewStyles.keyInput}
          placeholder="Enter a key"
        />
        <Button
          style={ViewStyles.connectButton}
          disabled={isButtonDisabled}
          onPress={async () => {
            await mostRecentRoomKey.save(key);
            if (onPressConnect) onPressConnect(key);
          }}
        >
          <Text style={buttonTextStyle}>Connect</Text>
        </Button>
      </View>
    </Background>
  );
};

const useKey = () => {
  const [key, setKey] = useState(null);

  useEffect(() => {
    mostRecentRoomKey
      .read()
      .then((recordedKey) => !key && recordedKey && setKey(recordedKey));
  }, []);

  return { key, setKey };
};

const ViewStyles = StyleSheet.create({
  keyInputContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 30,
  },
  keyText: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    textAlign: "center",
    marginBottom: 20,
  },
  keyInput: {
    backgroundColor: "white",
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    padding: 5,
  },
  connectButton: {
    margin: 15,
    borderRadius: borderRadius,
    width: "50%",
  },
  connectButtonText: {
    color: "white",
    padding: 10,
    textAlign: "center",
    fontSize: 20,
  },
});
