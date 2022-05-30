import { useCallback, useEffect, useState } from "react";
import { useHasUnmounted } from "./use-has-unmounted";

export const useConnectToRoom = (client) => {
  const [connectToRoomError, setConnectedToRoomError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectedToRoom, setIsConnectedToRoom] = useState(false);

  const hasUnmounted = useHasUnmounted();

  useEffect(() => {
    client?.addOnMessageEventListener(
      "confirmRoomConnection",
      () => {
        if (hasUnmounted) return;
        setIsLoading(false);
        setIsConnectedToRoom(true);
        setConnectedToRoomError(null);
      },
      ({ parsedData }) => {
        if (hasUnmounted) return;
        setIsLoading(false);
        setConnectedToRoomError(parsedData.error);
      }
    );

    client?.addOnCloseEventListener("on-close", () => {
      if (hasUnmounted) return;
      setIsConnectedToRoom(false);
      setConnectedToRoomError(new Error("client connection has closed"));
    });

    () => {
      client?.removeOnMessageEventListener("confirmRoomConnection");
      client?.removeOnCloseEventListener("on-close");
    };
  }, [client]);

  const connectToRoom = useCallback(
    (password) => {
      if (client) {
        client.send(
          JSON.stringify({
            type: "connectToRoom",
            data: { password },
          })
        );

        setIsLoading(true);
      }
    },
    [client]
  );

  const clearError = useCallback(
    () => !connectToRoomError && setConnectedToRoomError(null),
    [setConnectedToRoomError]
  );

  // clear errors when client is recreated
  useEffect(() => {
    if (client) clearError();
  }, [client]);

  return {
    isLoading,
    isConnectedToRoom,
    connectToRoomError,
    connectToRoom,
    clearError,
  };
};
