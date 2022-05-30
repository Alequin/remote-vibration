import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

export const useKeepAwake = ({ shouldKeepAwake }) => {
  useEffect(() => {
    if (shouldKeepAwake) {
      activateKeepAwake();
      return () => deactivateKeepAwake();
    }
  }, [shouldKeepAwake]);
};
