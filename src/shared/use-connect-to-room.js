import { useCallback, useEffect, useState } from "react";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

const closedWebsocketConnectionStates = [2, 3];

export const useConnectToRoom = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [connectToRoomError, setConnectedToRoomError] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const clearError = useCallback(() => setConnectedToRoomError(null), [
    setConnectedToRoomError,
  ]);

  const connectToClient = useCallback(async () => {
    try {
      const newClient = await establishWebsocketConnection();

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

      setClient(newClient);
    } catch (error) {
      setIsLoading(false);
      setWebsocketError(error);
    }
  }, []);

  // Create client and Connect to room
  useEffect(() => {
    if (!client) connectToClient();
    return () => client?.close();
  }, [client]);

  // Show error page if client disconnects unexpectedly
  useEffect(() => {
    if (closedWebsocketConnectionStates.includes(client?.readyState)) {
      setWebsocketError("client connection closed");
    } else {
      setWebsocketError(null);
    }
  }, [client?.readyState]);

  const connectToRoom = useCallback(
    (password) => {
      if (client) {
        client.send(
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
