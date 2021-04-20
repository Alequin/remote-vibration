import { reject } from "lodash";
import { newWebsocketClient } from "./establish-websocket-connection/new-websocket-client";

export const websocketConnection = () => {
  let client = null;
  let isDisconnected = false;

  const disconnect = () => {
    isDisconnected = true;
    client?.close();
  };

  const connect = async () => {
    return new Promise((resolve, reject) => {
      const client = newWebsocketClient();

      applyOnMessageHandlersFunctions(client);
      applyOnCloseHandlersFunctions(client);

      let hasTimedOut = false;
      const timeout = setTimeout(() => {
        hasTimedOut = true;
        reject("connection timeout");
      }, 30000);

      client.onopen = () => {
        // If it connects after timing out or disconnecting close instantly
        if (hasTimedOut || isDisconnected) client.close();
        clearTimeout(timeout);
        resolve(client);
      };
      client.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      client.addOnCloseEventListener("reject-on-close", () => {
        clearTimeout(timeout);
        reject("connection closed");
      });
    });
  };

  return {
    connect,
    disconnect,
  };
};

const applyOnMessageHandlersFunctions = (client) => {
  let onMessageEventHandlers = [];

  client.onmessage = (message) => {
    const parsedData = JSON.parse(message.data);

    onMessageEventHandlers.forEach(({ key, eventHandler, errorHandler }) => {
      if (parsedData.error) {
        errorHandler && errorHandler({ ...message, parsedData });
        return;
      }
      if (key === parsedData.type) eventHandler({ ...message, parsedData });
    });
  };

  client.addOnMessageEventListener = (key, eventHandler, errorHandler) => {
    onMessageEventHandlers.push({ key, eventHandler, errorHandler });
  };
  client.removeOnMessageEventListener = (keyToRemove) => {
    onMessageEventHandlers = reject(
      onMessageEventHandlers,
      ({ key }) => key === keyToRemove
    );
  };
};

const applyOnCloseHandlersFunctions = (client) => {
  let onCloseEventHandlers = [];

  client.onclose = () =>
    onCloseEventHandlers.forEach(({ eventHandler }) => eventHandler());

  client.addOnCloseEventListener = (key, eventHandler) => {
    onCloseEventHandlers.push({ key, eventHandler });
  };
  client.removeOnCloseEventListener = (keyToRemove) => {
    onCloseEventHandlers = reject(
      onCloseEventHandlers,
      ({ key }) => key === keyToRemove
    );
  };
};
