import { isEmpty } from "lodash";
import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Background } from "../../shared/background";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { mostRecentRoomKey } from "../../utilities/async-storage";

export const EnterKeyContainer = ({ onPressConnect, testID }) => {
  const { key, setKey } = useKey();

  const isButtonDisabled = isEmpty(key);

  const buttonTextStyle = useMemo(() => {
    return {
      ...ViewStyles.connectButtonText,
      opacity: isButtonDisabled ? 0.4 : 1,
    };
  }, [isButtonDisabled]);

  return (
    <Background testID={testID}>
      <View style={ViewStyles.keyInputContainer}>
        <Text style={ViewStyles.keyText}>
          Enter a password to receive vibrations
        </Text>
        <KeyInput value={key} onChangeText={setKey} />
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

const KeyInput = ({ value, onChangeText }) => {
  return (
    <View style={ViewStyles.keyInputWrapper}>
      <Icon icon="blankSpace" size={32} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={ViewStyles.keyInput}
        placeholder="Password"
      />
      <TouchableOpacity onPress={() => onChangeText("")}>
        <Icon icon="cancel" size={32} />
      </TouchableOpacity>
    </View>
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
    justifyContent: "center",
    width: "100%",
    height: "60%",
    marginTop: 30,
  },
  keyText: {
    color: "black",
    fontSize: 24,
    textAlign: "center",
    textAlign: "center",
    marginBottom: 20,
  },
  keyInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "grey",
  },
  keyInput: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    padding: 5,
    flex: 1,
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
