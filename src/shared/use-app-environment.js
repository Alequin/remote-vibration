import { useEffect, useState } from "react";
import * as asyncStorage from "../utilities/async-storage";
import { newDeviceKey } from "./use-app-state/new-device-key";

export const useAppEnvironment = () => {
  const { deviceId } = useDeviceId();

  return {
    environment: process.env.NODE_ENV,
    isLoading: !deviceId,
    deviceId,
  };
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
