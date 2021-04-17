import Clipboard from "expo-clipboard";
import { isEmpty } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { Page } from "../../shared/page";
import { StyledText } from "../../shared/styled-text";
import { mostRecentRoomKey } from "../../utilities/async-storage";
import { darkSpaceCadet, transparency, white } from "../../utilities/colours";

export const EnterPasswordContainer = ({
  onPressConnect,
  error,
  testID,
  password,
  onChangeText,
}) => {
  const isButtonDisabled = isEmpty(password);

  return (
    <Page testID={testID} style={useContainerStyle(error)}>
      <StyledText style={ViewStyles.keyText}>
        {`Enter another person's\npassword to receive vibrations`}
      </StyledText>
      <KeyInput value={password} onChangeText={onChangeText} />
      <Button
        style={ViewStyles.connectButton}
        disabled={isButtonDisabled}
        onPress={async () => {
          await mostRecentRoomKey.save(password);
          if (onPressConnect) onPressConnect(password);
        }}
      >
        <StyledText style={useButtonStyle(isButtonDisabled)}>
          Connect
        </StyledText>
      </Button>
      {error && (
        <View>
          <StyledText
            style={ViewStyles.errorText}
          >{`There is no one with the password\n"${password}"`}</StyledText>
          <StyledText style={ViewStyles.errorText}>
            Check the password is correct and try again
          </StyledText>
        </View>
      )}
    </Page>
  );
};

const useContainerStyle = (error) =>
  useMemo(
    () => ({
      ...ViewStyles.keyInputContainer,
      height: error ? "100%" : "80%",
    }),
    [error]
  );

const useButtonStyle = (isButtonDisabled) =>
  useMemo(() => {
    return {
      ...ViewStyles.connectButtonText,
      opacity: isButtonDisabled ? 0.4 : 1,
    };
  }, [isButtonDisabled]);

const KeyInput = ({ value, onChangeText }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <View style={ViewStyles.keyInputWrapper}>
      <Icon icon="blankSpace" size={32} />
      <Icon icon="blankSpace" size={32} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        style={ViewStyles.keyInput}
        placeholder="Password"
        placeholderTextColor={transparency(white, "80")}
        selectionColor="white"
      />
      <TouchableOpacity
        onPress={() => Clipboard.getStringAsync().then(onChangeText)}
      >
        <Icon icon="pasteFromClipboard" color="white" size={32} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChangeText("")}>
        <Icon icon="cancel" color="white" size={32} />
      </TouchableOpacity>
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  keyInputContainer: {
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: "80%",
    padding: "7.5%",
  },
  keyText: {
    fontSize: 24,
    textAlign: "center",
    textAlign: "center",
  },
  keyInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: transparency(darkSpaceCadet, "66"),
  },
  keyInput: {
    textAlign: "center",
    color: "white",
    fontSize: 24,
    padding: 5,
    flex: 1,
  },
  connectButton: {
    borderRadius: borderRadius,
    width: "100%",
  },
  connectButtonText: {
    color: "white",
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    borderWidth: 1,
    borderRadius: borderRadius,
    borderColor: "white",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    margin: 10,
  },
});
