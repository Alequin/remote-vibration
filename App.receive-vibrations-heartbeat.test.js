jest.mock("expo-keep-awake", () => ({
  activateKeepAwake: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));
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
jest.mock(
  "./src/pages/send-vibrations/hide-loading-indicator-interval",
  () => ({
    hideLoadingIndicatorInterval: () => 0,
  })
);
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}));

import "@testing-library/jest-native/extend-expect";
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import nock from "nock";
import React from "React";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - receive vibrations", () => {
  let mockWebsocketClient = null;

  let establishWebsocketSpy = null;
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebsocketClient = { close: jest.fn(), send: jest.fn() };
    establishWebsocketSpy = jest
      .spyOn(newWebsocketClient, "newWebsocketClient")
      .mockReturnValue(mockWebsocketClient);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("sends heartbeat messages every 30 seconds while connected to a room in order to maintain the connection", async () => {
    const { getByTestId, getAllByRole, findAllByRole, getByPlaceholderText } =
      render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. Makes the call to open a websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 4. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 5. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Password"), MOCK_ROOM_KEY)
    );

    // 6. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 7. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { password: MOCK_ROOM_KEY },
      })
    );

    // 8. Fake receiving a message confirming the room connection
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "confirmRoomConnection",
        }),
      })
    );

    // 8. Confirm a heartbeat message is sent after 30 seconds
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

    // 9. Confirm another heartbeat message is sent after another 30 seconds
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

const moveToReceiveVibrationsPage = async (findAllByRole) => {
  const mainMenuButtons = await findAllByRole("button");

  const receiveVibrationsButton = mainMenuButtons.find((button) =>
    within(button).queryByText(pageNames.receiveVibrations)
  );

  await act(async () => fireEvent.press(receiveVibrationsButton));
};
