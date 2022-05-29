import { useCallback, useEffect, useState } from "react";
import { websocketConnection } from "../utilities/websocket-connection";

export const useConnectToRoom = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [connectToRoomError, setConnectedToRoomError] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectedToRoom, setIsConnectedToRoom] = useState(false);

  let hasUnmounted = false;
  useEffect(() => () => (hasUnmounted = true), []);

  const startWebsocketConnection = useCallback(async () => {
    if (hasUnmounted) return;
    setWebsocketError(null);
    setConnectedToRoomError(null);
    try {
      const activeConnection = await websocketConnection();
      if (hasUnmounted) return;

      activeConnection.client.addOnMessageEventListener(
        "confirmRoomConnection",
        () => {
          if (hasUnmounted) return;
          setIsLoading(false);
          setIsConnectedToRoom(true);
        },
        ({ parsedData }) => {
          if (hasUnmounted) return;
          setIsLoading(false);
          setConnectedToRoomError(parsedData.error);
        }
      );

      activeConnection.client.addOnCloseEventListener("on-close", () => {
        if (hasUnmounted) return;
        setIsConnectedToRoom(false);
        setWebsocketError("client connection closed");
      });

      setConnection(activeConnection);
      return activeConnection;
    } catch (error) {
      if (hasUnmounted) return;
      setIsLoading(false);
      setWebsocketError(error);
    }
  }, []);

  useEffect(() => {
    const activeConnection = startWebsocketConnection();
    return () => activeConnection?.then(({ disconnect }) => disconnect());
  }, []);

  const connectToRoom = useCallback(
    (password) => {
      if (connection) {
        connection.client.send(
          JSON.stringify({
            type: "connectToRoom",
            data: { password },
          })
        );

        setIsLoading(true);
      }
    },
    [connection]
  );

  useEffect(() => {
    if (connection?.client && isConnectedToRoom) {
      const interval = setInterval(() => {
        console.log("send heartbeat");
        connection.client.send(
          JSON.stringify({
            type: "heartbeat",
          })
        );
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [connection?.client, isConnectedToRoom]);

  return {
    client: connection?.client,
    resetClient: startWebsocketConnection,
    isLoading,
    isConnectedToRoom,
    connectToRoomError,
    websocketError,
    connectToRoom,
    clearError: useCallback(
      () => !connectToRoomError && setConnectedToRoomError(null),
      [setConnectedToRoomError]
    ),
  };
};
