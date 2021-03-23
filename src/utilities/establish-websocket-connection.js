import { w3cwebsocket as W3CWebSocket } from "websocket";

const websocketServer = `ws://remote-vibration-server.herokuapp.com/`;

export const establishWebsocketConnection = () =>
  new W3CWebSocket(websocketServer);
