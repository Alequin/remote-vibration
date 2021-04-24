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

  const connectToClient = useCallback(() => {
    setWebsocketError(null);
    setWebsocketError(null);
    const clientManager = websocketConnection();

    clientManager
      .connect()
      .then((newClient) => {
        newClient.addOnMessageEventListener(
          "confirmRoomConnection",
          () => {
            setIsLoading(false);
            setIsConnected(true);
          },
          ({ parsedData }) => {
            setIsLoading(false);
            setConnectedToRoomError(parsedData.error);
          }
        );

        // Show error page if client disconnects unexpectedly
        newClient.addOnCloseEventListener("on-close", () => {
          setIsConnected(false);
          setWebsocketError("client connection closed");
        });

        setClient(newClient);
      })
      .catch((error) => {
        setIsLoading(false);
        setWebsocketError(error);
      });

    return () => clientManager?.disconnect();
  }, []);

  // Create client on mount
  useEffect(connectToClient, []);

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
    resetClient: connectToClient,
    isLoading,
    isConnected,
    connectToRoomError,
    websocketError,
    clearError,
    connectToRoom,
  };
};

const sendConnectToRoomMessage = () => {};
