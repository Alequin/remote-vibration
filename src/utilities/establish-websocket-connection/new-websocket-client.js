var { w3cwebsocket } = require("websocket");
import { authToken } from "../../../auth-token.json";

const websocketServer = `ws://remote-vibration-server.herokuapp.com/?authToken=${authToken}`;

export const newWebsocketClient = () => new w3cwebsocket(websocketServer);
