import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import * as asyncStorage from "../utilities/async-storage";
import { isStateActive } from "./use-app-state/is-state-active";

export const useAppActiveState = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [isAppActive, setIsAppActive] = useState(isStateActive(appState));

  const handleAppStateChange = useCallback(
    (nextAppState) => {
      setIsAppActive(isStateActive(nextAppState));
      setAppState(nextAppState);
    },
    [setAppState, setIsAppActive, isStateActive]
  );

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => AppState.removeEventListener("change", handleAppStateChange);
  }, [handleAppStateChange]);

  useEffect(() => {
    if (!isAppActive) asyncStorage.lastActiveVibrationPattern.clear();
  }, [isAppActive]);

  return { isAppActive, appState };
};
