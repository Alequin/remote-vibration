import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useIsKeyboardVisible = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  return isKeyboardVisible;
};
