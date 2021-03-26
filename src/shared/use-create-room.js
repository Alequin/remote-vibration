import fetch from "node-fetch";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";

export const useCreateRoom = () => {
  const { deviceId, isAppActive } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [connectionKey, setConnectionKey] = useState(null);

  useEffect(() => {
    if (isAppActive) {
      fetch("http://remote-vibration-server.herokuapp.com/room", {
        method: "POST",
        headers: { deviceId },
      })
        .then(async (response) => {
          const { roomKey } = await response.json();
          setConnectionKey(roomKey);
        })
        .catch((error) => {
          console.error(error);
          setError(error);
        });
    }
  }, [isAppActive]);

  return { connectionKey, isLoading: !connectionKey, error };
};
