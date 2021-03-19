import { useState, useEffect } from "react";
import { AppState } from "react-native";
import { useCallback } from "react/cjs/react.development";
import { isStateActive } from "./is-state-active";

export const useAppState = () => {
  const [isAppActive, setIsAppActive] = useState(
    isStateActive(AppState.current)
  );
  const [appState, setAppState] = useState(AppState.current);

  const handleAppStateChange = useCallback(
    (nextAppState) => {
      setIsAppActive(!isStateActive(appState) && isStateActive(nextAppState));
      setAppState(nextAppState);
    },
    [setAppState, setIsAppActive, isStateActive]
  );

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => AppState.removeEventListener("change", handleAppStateChange);
  }, [handleAppStateChange]);

  return { isAppActive, appState };
};
