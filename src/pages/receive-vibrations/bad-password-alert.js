import { Alert } from "react-native";

export const badPasswordAlert = ({ password, onClose }) => {
  Alert.alert(
    "Sorry there was an issue",
    `There is no one with the password "${password}".\n\nCheck the password is correct and try again`,
    [
      {
        text: "Continue",
        onPress: () => onClose(),
      },
    ],
    { cancelable: true, onDismiss: () => onClose() }
  );
};
