import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useIsKeyboardVisible = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const setKeyboardIsVisible = () => setIsKeyboardVisible(true);
    const setKeyboardIsHidden = () => setIsKeyboardVisible(false);
    const didShowListener = Keyboard.addListener(
      "keyboardDidShow",
      setKeyboardIsVisible
    );
    const didHideListener = Keyboard.addListener(
      "keyboardDidHide",
      setKeyboardIsHidden
    );

    // cleanup function
    return () => {
      didShowListener.remove();
      didHideListener.remove();
    };
  }, []);

  return isKeyboardVisible;
};
