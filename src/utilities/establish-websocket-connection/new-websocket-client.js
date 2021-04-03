import { w3cwebsocket as W3CWebSocket } from "websocket";

const websocketServer = `ws://remote-vibration-server.herokuapp.com/`;

export const newWebsocketClient = () => new W3CWebSocket(websocketServer);
