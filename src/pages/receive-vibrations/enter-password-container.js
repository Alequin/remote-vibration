import Clipboard from "expo-clipboard";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Background } from "../../shared/background";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { mostRecentRoomKey } from "../../utilities/async-storage";

export const EnterPasswordContainer = ({
  onPressConnect,
  testID,
  password,
  error,
  onChangeText,
}) => {
  const isButtonDisabled = isEmpty(password);

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
        <KeyInput value={password} onChangeText={onChangeText} />
        <Button
          style={ViewStyles.connectButton}
          disabled={isButtonDisabled}
          onPress={async () => {
            await mostRecentRoomKey.save(password);
            if (onPressConnect) onPressConnect(password);
          }}
        >
          <Text style={buttonTextStyle}>Connect</Text>
        </Button>
        {error && (
          <>
            <Text>{`There is no one with the password "${password}"`}</Text>
            <Text>Check the password is correct and try again</Text>
          </>
        )}
      </View>
    </Background>
  );
};

const KeyInput = ({ value, onChangeText }) => {
  return (
    <View style={ViewStyles.keyInputWrapper}>
      <Icon icon="blankSpace" size={32} />
      <Icon icon="blankSpace" size={32} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={ViewStyles.keyInput}
        placeholder="Password"
      />
      <TouchableOpacity
        onPress={() => Clipboard.getStringAsync().then(onChangeText)}
      >
        <Icon icon="pasteFromClipboard" size={32} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChangeText("")}>
        <Icon icon="cancel" size={32} />
      </TouchableOpacity>
    </View>
  );
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
