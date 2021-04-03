import { reject } from "lodash";
import { newWebsocketClient } from "./establish-websocket-connection/new-websocket-client";

export const establishWebsocketConnection = () => {
  const client = newWebsocketClient();

  let onMessageEventHandlers = [];

  client.onmessage = (message) => {
    const parsedData = JSON.parse(message.data);
    onMessageEventHandlers.forEach(({ eventHandler }) =>
      eventHandler({ ...message, parsedData })
    );
  };

  client.addOnMessageEventListener = (key, eventHandler) =>
    onMessageEventHandlers.push({ key, eventHandler });

  client.removeOnMessageEventListener = (keyToRemove) => {
    onMessageEventHandlers = reject(
      onMessageEventHandlers,
      ({ key }) => key === keyToRemove
    );
  };

  return client;
};
