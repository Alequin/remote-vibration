import * as Network from "expo-network";
import { useState } from "react";
import { useEffect } from "react/cjs/react.development";

// TODO - add permission for reading internet access
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
