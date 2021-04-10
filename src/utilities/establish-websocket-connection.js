import { reject } from "lodash";
import { newWebsocketClient } from "./establish-websocket-connection/new-websocket-client";

export const establishWebsocketConnection = () => {
  const client = newWebsocketClient();

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

  client.addOnMessageEventListener = (key, eventHandler, errorHandler) =>
    onMessageEventHandlers.push({ key, eventHandler, errorHandler });

  client.removeOnMessageEventListener = (keyToRemove) => {
    onMessageEventHandlers = reject(
      onMessageEventHandlers,
      ({ key }) => key === keyToRemove
    );
  };

  return client;
};
