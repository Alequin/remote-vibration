import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";
import { establishWebsocketConnection } from "../utilities/establish-websocket-connection";

export const useConnectToRoom = (connectionKey) => {
  const { isAppActive } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

      client.onmessage = ({ data }) => {
        const parsedResponse = JSON.parse(data);

        if (parsedResponse.error) setError(parsedResponse.error);
        if (parsedResponse.type === "confirmRoomConnection")
          setIsLoading(false);
      };
    }
  }, [isAppActive, connectionKey]);

  // Clean up the client on unmount assuming there is one
  useEffect(() => () => client && client.close(), [client]);

  return {
    client,
    connectionKey,
    isLoading,
    error,
  };
};
