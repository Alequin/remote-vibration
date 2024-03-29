import * as Clipboard from "expo-clipboard";
import isEmpty from "lodash/isEmpty";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { Page } from "../../shared/page";
import { StyledText } from "../../shared/styled-text";
import { useIsKeyboardVisible } from "../../shared/use-is-keyboard-visible";
import { mostRecentRoomKey } from "../../utilities/async-storage";
import { darkSpaceCadet, transparency, white } from "../../utilities/colours";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";
import {
  isSmallScreen,
  isSmallScreenHeight,
} from "../../utilities/is-small-screen";

const windowHeight = Dimensions.get("window").height;

export const EnterPasswordContainer = ({
  onPressConnect,
  testID,
  password,
  onChangeText,
  shouldShowLoadingIndicator,
}) => {
  const isButtonDisabled = isEmpty(password);
  const isKeyboardVisible = useIsKeyboardVisible();

  return (
    <Page testID={testID} style={ViewStyles.keyInputContainer}>
      {(!isKeyboardVisible || !isSmallScreenHeight()) && (
        <StyledText style={ViewStyles.keyText}>
          {`Enter another person's password to receive vibrations`}
        </StyledText>
      )}
      <KeyInput
        value={password}
        onChangeText={onChangeText}
        shouldShowLoadingIndicator={shouldShowLoadingIndicator}
      />
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
    </Page>
  );
};

const useButtonStyle = (isButtonDisabled) =>
  useMemo(() => {
    return {
      ...ViewStyles.connectButtonText,
      opacity: isButtonDisabled ? 0.4 : 1,
    };
  }, [isButtonDisabled]);

const KeyInput = ({ value, onChangeText, shouldShowLoadingIndicator }) => {
  if (shouldShowLoadingIndicator) return null;

  return (
    <View style={ViewStyles.keyInputWrapper}>
      <Icon icon="blankSpace" size={30} />
      <Icon icon="blankSpace" size={30} />
      <TextInput
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
        <Icon icon="pasteFromClipboard" color="white" size={30} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChangeText(null)}>
        <Icon icon="cancel" color="white" size={30} />
      </TouchableOpacity>
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  keyInputContainer: {
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: "100%",
    padding: "2.5%",
  },
  keyText: {
    fontSize: 18,
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
    fontSize: 20,
    padding: 5,
    flex: 1,
  },
  connectButton: {
    borderRadius: borderRadius,
    width: "70%",
    borderWidth: 1,
    borderRadius: borderRadius,
    borderColor: "white",
  },
  connectButtonText: {
    color: "white",
    padding: windowHeight * 0.01,
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    fontSize: 17,
    textAlign: "center",
    margin: 10,
  },
});
