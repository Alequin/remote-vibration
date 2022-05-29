jest.mock("react-native/Libraries/AppState/AppState", () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentState: "active",
}));
// hides warning about module which cannot be used in tests
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock(
  "./src/pages/send-vibrations/hide-loading-indicator-interval",
  () => ({
    hideLoadingIndicatorInterval: () => 0,
  })
);
jest.genMockFromModule("expo-clipboard");

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import nock from "nock";
import React from "React";
import { AppState } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import { authToken } from "./secrets.json";
import * as pageNames from "./src/pages/page-names";
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - send vibrations", () => {
  let mockWebsocketClient = null;

  let establishWebsocketSpy = null;
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebsocketClient = { close: jest.fn(), send: jest.fn() };
    establishWebsocketSpy = jest
      .spyOn(newWebsocketClient, "newWebsocketClient")
      .mockReturnValue(mockWebsocketClient);
    AppState.addEventListener.mockImplementation(() => ({ remove: jest.fn() }));
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("sends heartbeat messages every 30 seconds while connected to a room in order to maintain the connection", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(getByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(getByTestId("send-vibrations-page")).toBeDefined();
    });

    await waitFor(async () => {
      // 3. Makes the call to the server to create the room
      expect(createARoomInterceptor.isDone()).toBe(true);
    });

    await waitForExpect(async () => {
      // 4. Make the call to open a websocket
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 5. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await waitFor(() => mockWebsocketClient.onopen());

    // 6. Confirm a message is sent to connect to the new room
    await waitForExpect(() => {
      expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
      expect(mockWebsocketClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: "connectToRoom",
          data: { password: MOCK_ROOM_KEY },
        })
      );
    });

    // 7. Fake receiving a message confirming the room connection
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "confirmRoomConnection",
        }),
      })
    );

    // 8. Confirm a heartbeat message is after 30 seconds
    mockWebsocketClient.send.mockClear();
    await waitForExpect(
      () => {
        expect(mockWebsocketClient.send).toHaveBeenCalledWith(
          JSON.stringify({
            type: "heartbeat",
          })
        );
      },
      { timeout: 40_000, interval: 1_000 }
    );

    // 9. Confirm another heartbeat message is after another 30 seconds
    mockWebsocketClient.send.mockClear();
    await waitForExpect(
      () => {
        expect(mockWebsocketClient.send).toHaveBeenCalledWith(
          JSON.stringify({
            type: "heartbeat",
          })
        );
      },
      { timeout: 40_000, interval: 1_000 }
    );
  }, 120_000);
});

const moveToSendVibrationsPage = async (getAllByRole) => {
  const mainMenuButtons = getAllByRole("button");

  const sendVibrationsButton = mainMenuButtons.find((button) =>
    within(button).queryByText(pageNames.sendVibrations)
  );

  await act(async () => fireEvent.press(sendVibrationsButton));
};

const mockCreateARoom = ({ delayTime, response } = {}) =>
  nock("http://remote-vibration-server.herokuapp.com", {
    reqheaders: {
      deviceId: MOCK_DEVICE_ID,
      authToken,
    },
  })
    .post("/room")
    .delay(delayTime || 1)
    .reply(
      response?.status || 200,
      response?.body || { password: MOCK_ROOM_KEY }
    );
