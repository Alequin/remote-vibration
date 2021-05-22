import Constants from "expo-constants";
import { useEffect, useState } from "react";
import * as asyncStorage from "../utilities/async-storage";
import { newDeviceKey } from "./use-app-state/new-device-key";

export const useAppEnvironment = () => {
  const { isNewSession, sessionId, hasLoadedSession } = useIsNewSession();
  const { deviceId } = useDeviceId(isNewSession);

  return {
    environment: process.env.NODE_ENV,
    isLoading: !hasLoadedSession || !deviceId,
    isNewSession,
    sessionId,
    deviceId,
  };
};

const useIsNewSession = () => {
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [sessionId, setSessionId] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);

  useEffect(() => {
    let hasUnmounted = false;
    asyncStorage.sessionId.read().then((recordedSessionId) => {
      if (hasUnmounted) return;
      const currentSessionId = Constants.sessionId;
      const isNewSession = currentSessionId !== recordedSessionId;

      if (isNewSession) asyncStorage.sessionId.save(currentSessionId);

      setIsNewSession(isNewSession);
      setSessionId(currentSessionId);
      setHasLoadedSession(true);
    });
    return () => (hasUnmounted = true);
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
