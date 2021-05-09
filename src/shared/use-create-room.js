import fetch from "node-fetch";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";
import { authToken } from "../../auth-token.json";

export const useCreateRoom = () => {
  const { deviceId, isAppActive } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState(null);

  useEffect(() => {
    let hasUnmounted = false;
    if (isAppActive) {
      fetch("http://remote-vibration-server.herokuapp.com/room", {
        method: "POST",
        headers: { deviceId, authToken },
      })
        .then(async (response) => {
          if (hasUnmounted) return;
          if (response.status >= 400) {
            throw new Error(
              `Received an error status while creating a room / ${response.status}`
            );
          }

          const { password } = await response.json();
          setPassword(password);
        })
        .catch(setError);
    }
    return () => (hasUnmounted = true);
  }, [isAppActive]);

  return { password, isLoading: !password, error };
};
