jest.mock("react-native/Libraries/AppState/AppState", () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));
// hides warning about module which cannot be used in tests
jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");
jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

import React from "React";
import nock from "nock";
import {
  fireEvent,
  render,
  within,
  act,
  waitFor,
} from "@testing-library/react-native";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";

import * as establishWebsocketConnection from "./src/utilities/establish-websocket-connection";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - Create a connection", () => {
  const mockWebsocketClient = { close: jest.fn(), send: jest.fn() };

  const establishWebsocketSpy = jest
    .spyOn(establishWebsocketConnection, "establishWebsocketConnection")
    .mockImplementation(() => mockWebsocketClient);

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
    establishWebsocketSpy.mockClear();
  });

  it("show a loading indicator when communication with the server takes a while", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(getByTestId("main-menu-page")).toBeDefined();

      await moveToCreateAConnectionPage(getAllByRole);

      // 2. Moves to expected page
      expect(getByTestId("create-a-connection-page")).toBeDefined();

      expect(getByTestId("loadingIndicator")).toBeDefined();
    });
  });

  it("creates a new connection on visiting the 'create-a-connection' page", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, getByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(getByTestId("main-menu-page")).toBeDefined();

      await moveToCreateAConnectionPage(getAllByRole);

      // 2. Moves to expected page
      expect(getByTestId("create-a-connection-page")).toBeDefined();
    });

    await waitFor(async () => {
      // 3. Makes the call to the server to create the room
      expect(createARoomInterceptor.isDone()).toBe(true);
    });
    console.log(
      "🚀 ~ file: App.create-a-connection.test.js ~ line 49 ~ beforeEach ~ establishWebsocketSpy",
      establishWebsocketSpy.mock.calls
    );

    await waitFor(async () => {
      // 4. Make the call to open a websocket
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 5. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    act(() => mockWebsocketClient.onopen());

    // 6. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );

    // 7. Confirm the connection key is presented to the user
    expect(await findByText(`Connection Key: ${MOCK_ROOM_KEY}`));
  });
});

const moveToCreateAConnectionPage = async (getAllByRole) => {
  const mainMenuButtons = getAllByRole("button");

  const connectToAnotherDeviceButton = mainMenuButtons.find((button) =>
    within(button).queryByText("Connect To Another Device")
  );

  await act(async () => fireEvent.press(connectToAnotherDeviceButton));

  const connectToADeviceMenuButtons = getAllByRole("button");

  const createAConnectionButton = connectToADeviceMenuButtons.find((button) =>
    within(button).queryByText(pageNames.createAConnection)
  );

  return await act(async () => fireEvent.press(createAConnectionButton));
};

const mockCreateARoom = () =>
  nock("http://remote-vibration-server.herokuapp.com", {
    reqheaders: {
      deviceId: MOCK_DEVICE_ID,
    },
  })
    .post("/room")
    .reply(200, { roomKey: MOCK_ROOM_KEY });
