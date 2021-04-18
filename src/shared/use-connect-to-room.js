import { useCallback, useEffect, useState } from "react";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

const closedWebsocketConnectionStates = [2, 3];

export const useConnectToRoom = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [connectToRoomError, setConnectedToRoomError] = useState(null);
  const [connectToRoomTimeout, setConnectToRoomTimeout] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const clearError = useCallback(() => setConnectedToRoomError(null), [
    setConnectedToRoomError,
  ]);

  const connectToClient = useCallback(async () => {
    const websocketConnectionTimeout = setTimeout(
      () => setWebsocketError("timeout"),
      30000
    );

    try {
      const newClient = await establishWebsocketConnection();

      newClient.addOnMessageEventListener(
        "confirmRoomConnection",
        () => {
          setIsLoading(false);
          setIsConnected(true);
          clearInterval(connectToRoomTimeout);
        },
        ({ parsedData }) => {
          setIsLoading(false);
          setConnectedToRoomError(parsedData.error);
          clearInterval(connectToRoomTimeout);
        }
      );

      clearInterval(websocketConnectionTimeout);
      setClient(newClient);
    } catch (error) {
      setIsLoading(false);
      setWebsocketError(error);
      clearInterval(connectToRoomTimeout);
    }
  }, [connectToRoomTimeout]);

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
        setConnectToRoomTimeout(
          setTimeout(() => setConnectedToRoomError("timeout"), 30000)
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
