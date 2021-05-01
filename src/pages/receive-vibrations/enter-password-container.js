import Clipboard from "expo-clipboard";
import { isEmpty } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { borderRadius } from "../../shared/border-radius";
import { Button } from "../../shared/button";
import { Icon } from "../../shared/icon";
import { Page } from "../../shared/page";
import { StyledText } from "../../shared/styled-text";
import { mostRecentRoomKey } from "../../utilities/async-storage";
import { darkSpaceCadet, transparency, white } from "../../utilities/colours";
import { dynamicFontSize } from "../../utilities/dynamic-font-size";
import { isSmallScreen } from "../../utilities/is-small-screen";

const windowHeight = Dimensions.get("window").height;

export const EnterPasswordContainer = ({
  onPressConnect,
  testID,
  password,
  onChangeText,
  shouldShowLoadingIndicator,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isButtonDisabled = isEmpty(password);

  useEffect(() => {
    const setKeyboardIsVisible = () => setIsKeyboardVisible(true);
    const setKeyboardIsHidden = () => setIsKeyboardVisible(false);
    Keyboard.addListener("keyboardDidShow", setKeyboardIsVisible);
    Keyboard.addListener("keyboardDidHide", setKeyboardIsHidden);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", setKeyboardIsVisible);
      Keyboard.removeListener("keyboardDidHide", setKeyboardIsHidden);
    };
  }, []);

  return (
    <Page testID={testID} style={ViewStyles.keyInputContainer}>
      {(!isKeyboardVisible || !isSmallScreen()) && (
        <StyledText style={ViewStyles.keyText}>
          {`Enter another person's\npassword to receive vibrations`}
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
      <Icon icon="blankSpace" size={32} />
      <Icon icon="blankSpace" size={32} />
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
    height: "100%",
    padding: "2.5%",
  },
  keyText: {
    fontSize: dynamicFontSize(20),
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
    fontSize: dynamicFontSize(20),
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
    fontSize: dynamicFontSize(18),
  },
  errorText: {
    fontSize: dynamicFontSize(17),
    textAlign: "center",
    margin: 10,
  },
});
