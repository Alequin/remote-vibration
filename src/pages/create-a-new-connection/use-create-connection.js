import fetch from "node-fetch";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../app-context";
import { establishWebsocketConnection } from "../../utilities/establish-websocket-connection";

export const useCreateConnection = () => {
  const { deviceId, isAppActive } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [connectionKey, setConnectionKey] = useState(null);

  useEffect(() => {
    if (isAppActive) {
      fetch("http://remote-vibration-server.herokuapp.com/room", {
        method: "POST",
        headers: { deviceId },
      })
        .then(async (response) => {
          const { roomKey } = await response.json();
          const client = establishWebsocketConnection();

          client.onopen = () => {
            client.send(
              JSON.stringify({
                type: "connectToRoom",
                data: { roomKey: roomKey },
              })
            );

            setClient(client);
            setConnectionKey(roomKey);
          };
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        });
    }
  }, [isAppActive]);

  // Clean up the client on unmount assuming there is one
  useEffect(() => () => client && client.close(), [client]);

  return { client, connectionKey, isLoading: !client || !connectionKey, error };
};
