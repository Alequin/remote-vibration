import { useCallback, useContext, useEffect, useState } from "react";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

export const useConnectToRoom = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const clearError = useCallback(() => setError(null), [setError]);

  useEffect(() => {
    if (!client) {
      establishWebsocketConnection()
        .then((newClient) => {
          newClient.addOnMessageEventListener(
            "confirmRoomConnection",
            () => {
              setIsLoading(false);
              setIsConnected(true);
            },
            ({ parsedData }) => {
              setIsLoading(false);
              setError(parsedData.error);
            }
          );

          setClient(newClient);
        })
        .catch(setWebsocketError);
    }

    return () => client?.close();
  }, []);

  const connectToRoom = useCallback(
    (password) => {
      if (client) {
        client?.send(
          JSON.stringify({
            type: "connectToRoom",
            data: { roomKey: password },
          })
        );
        setIsLoading(true);
      }
    },
    [client]
  );

  return {
    client,
    isConnected,
    isLoading,
    error,
    websocketError,
    clearError,
    connectToRoom,
  };
};

const sendConnectToRoomMessage = () => {};
