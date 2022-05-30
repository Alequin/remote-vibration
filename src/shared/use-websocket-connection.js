import { useCallback, useEffect, useState } from "react";
import { websocketConnection } from "../utilities/websocket-connection";
import { useAppActiveState } from "./use-app-active-state";
import { useHasUnmounted } from "./use-has-unmounted";

export const useWebsocketConnection = () => {
  const [websocketError, setWebsocketError] = useState(null);
  const [connection, setConnection] = useState(null);

  const hasUnmounted = useHasUnmounted();

  const startWebsocketConnection = useCallback(async () => {
    if (hasUnmounted) return;
    setWebsocketError(null);
    try {
      const activeConnection = await websocketConnection();
      if (hasUnmounted) return;
      setConnection(activeConnection);
      return activeConnection;
    } catch (error) {
      if (hasUnmounted) return;
      setWebsocketError(error);
    }
  }, []);

  const { isAppActive } = useAppActiveState();

  // Connect client on mount and app moving to foreground
  useEffect(() => {
    if (isAppActive) {
      const activeConnection = startWebsocketConnection();
      return () => activeConnection?.then(({ disconnect }) => disconnect());
    }
  }, [isAppActive]);

  // Send heartbeat messages to keep client alive
  useEffect(() => {
    if (isAppActive && connection?.client) {
      const interval = setInterval(() => {
        connection.client.send(
          JSON.stringify({
            type: "heartbeat",
          })
        );
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [connection?.client, isAppActive]);

  return {
    client: connection?.client,
    resetClient: startWebsocketConnection,
    websocketError,
  };
};
