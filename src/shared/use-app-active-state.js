import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { isStateActive } from "./use-app-state/is-state-active";

export const useAppActiveState = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const isAppActive = useMemo(() => isStateActive(appState), [appState]);

  const handleAppStateChange = useCallback(
    (nextAppState) => {
      if (nextAppState !== appState) setAppState(nextAppState);
    },
    [isAppActive, appState, setAppState]
  );

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => AppState.removeEventListener("change", handleAppStateChange);
  }, [handleAppStateChange]);

  return { isAppActive, appState };
};
