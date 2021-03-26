import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

export const useConnectToRoom = (connectionKey) => {
  const { isAppActive } = useContext(AppContext);
  // TODO error handling
  // const [error, setError] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (connectionKey) {
      const client = establishWebsocketConnection();

      client.onopen = () => {
        client.send(
          JSON.stringify({
            type: "connectToRoom",
            data: { roomKey: connectionKey },
          })
        );

        setClient(client);
      };
    }
  }, [isAppActive, connectionKey]);

  // Clean up the client on unmount assuming there is one
  useEffect(() => () => client && client.close(), [client]);

  return {
    client,
    connectionKey,
    isLoading: !client,
    error: false,
  };
};
