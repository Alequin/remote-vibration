import { useState, useEffect } from "react";
import { AppState, Vibration } from "react-native";
import { useCallback } from "react/cjs/react.development";
import { isStateActive } from "./is-state-active";
import Constants from "expo-constants";
import * as asyncStorage from "../utilities/async-storage";
import { newDeviceKey } from "./new-device-key";

export const useAppState = () => {
  const { isAppActive, appState } = useAppActiveState();
  const { isNewSession, sessionId, hasLoadedSession } = useIsNewSession();
  const { deviceId } = useDeviceId(isNewSession);

  return {
    isLoading: !hasLoadedSession || !deviceId,
    isAppActive,
    appState,
    isNewSession,
    sessionId,
    deviceId,
  };
};

const useAppActiveState = () => {
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
    // Disable all vibration when the app moves to the background
    if (!isAppActive) Vibration.cancel();
  }, [isAppActive]);

  return { isAppActive, appState };
};

const useIsNewSession = () => {
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [sessionId, setSessionId] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);

  useEffect(() => {
    asyncStorage.sessionId.read().then(async (recordedSessionId) => {
      const currentSessionId = Constants.sessionId;
      const isNewSession = currentSessionId !== recordedSessionId;

      if (isNewSession) asyncStorage.sessionId.save(currentSessionId);

      setIsNewSession(isNewSession);
      setSessionId(currentSessionId);
      setHasLoadedSession(true);
    });
  }, []);

  return { sessionId, isNewSession, hasLoadedSession };
};

const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    asyncStorage.deviceId.read().then(async (deviceId) => {
      if (deviceId) {
        setDeviceId(deviceId);
      } else {
        // Create a device id if it is missing
        const newDeviceId = newDeviceKey();
        await asyncStorage.deviceId.save(newDeviceId);
        setDeviceId(newDeviceId);
      }
    });
  }, []);

  return { deviceId };
};

Constants.sessionId;
