import { useCallback, useEffect, useState } from "react";
import { websocketConnection } from "../utilities/websocket-connection";

export const useConnectToRoom = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [connectToRoomError, setConnectedToRoomError] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const clearError = useCallback(() => setConnectedToRoomError(null), [
    setConnectedToRoomError,
  ]);

  useEffect(() => {
    hasUnmounted = false;

    setWebsocketError(null);
    const clientManager = websocketConnection();

    if (!client) {
      clientManager
        .connect()
        .then((newClient) => {
          newClient.addOnMessageEventListener(
            "confirmRoomConnection",
            () => {
              if (hasUnmounted) return;
              setIsLoading(false);
              setIsConnected(true);
            },
            ({ parsedData }) => {
              if (hasUnmounted) return;
              setIsLoading(false);
              setConnectedToRoomError(parsedData.error);
            }
          );

          // Show error page if client disconnects unexpectedly
          newClient.addOnCloseEventListener("on-close", () => {
            if (hasUnmounted) return;
            setIsConnected(false);
            setWebsocketError("client connection closed");
          });

          setClient(newClient);
        })
        .catch((error) => {
          if (hasUnmounted) return;
          setIsLoading(false);
          setWebsocketError(error);
        });
    }
    return () => {
      clientManager?.disconnect();
      hasUnmounted = true;
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

  return {
    client,
    resetClient: useCallback(() => setClient(null), []),
    isLoading,
    isConnected,
    connectToRoomError,
    websocketError,
    clearError,
    connectToRoom,
  };
};

const sendConnectToRoomMessage = () => {};
