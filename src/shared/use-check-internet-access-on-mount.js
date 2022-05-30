import * as Network from "expo-network";
import { useState, useEffect } from "react";

export const useCheckInternetAccessOnMount = () => {
  const [hasInternetAccess, setHasInternetAccess] = useState(true);

  useEffect(() => {
    Network.getNetworkStateAsync().then(
      ({ isConnected, isInternetReachable }) =>
        setHasInternetAccess(!isConnected || !isInternetReachable)
    );
  }, []);

  return hasInternetAccess;
};
