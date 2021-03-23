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
jest.mock(
  "./src/pages/create-a-new-connection/hide-loading-indicator-interval",
  () => ({ hideLoadingIndicatorInterval: () => 0 })
);

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
import waitForExpect from "wait-for-expect";
import Clipboard from "expo-clipboard";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - Create a new connection", () => {
  const mockWebsocketClient = { close: jest.fn(), send: jest.fn() };

  const establishWebsocketSpy = jest
    .spyOn(establishWebsocketConnection, "establishWebsocketConnection")
    .mockImplementation(() => mockWebsocketClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("shows a loading indicator when communication with the server takes a while", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom({ delayTime: 5000 });

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
    expect(await findByText(`Connection Key:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));
  });

  it("allows the user to copy the connection key to the clipboard", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findByTestId, getAllByRole, findAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToCreateAConnectionPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("create-a-connection-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Connection Key:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press button to copy key
    await act(async () =>
      fireEvent.press(await findByTestId("copyConnectionKeyButton"))
    );

    // 5. Confirm the key is copied
    expect(Clipboard.setString).toHaveBeenCalledTimes(1);
    expect(Clipboard.setString).toHaveBeenCalledWith(MOCK_ROOM_KEY);
  }, 10_000);
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

const mockCallsToCreateConnection = async (
  createARoomInterceptor,
  establishWebsocketSpy,
  mockWebsocketClient
) => {
  await waitFor(async () => {
    // 1. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);
  });

  await waitFor(async () => {
    // 2. Make the call to open a websocket
    expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
  });

  // 3. Fake the connection to the websocket
  expect(mockWebsocketClient.onopen).toBeDefined();
  act(() => mockWebsocketClient.onopen());

  // 4. Confirm a message is send to connect to the new room
  expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
  expect(mockWebsocketClient.send).toHaveBeenCalledWith(
    JSON.stringify({
      type: "connectToRoom",
      data: { roomKey: MOCK_ROOM_KEY },
    })
  );
};

const mockCreateARoom = ({ delayTime } = {}) =>
  nock("http://remote-vibration-server.herokuapp.com", {
    reqheaders: {
      deviceId: MOCK_DEVICE_ID,
    },
  })
    .post("/room")
    .delay(delayTime || 1)
    .reply(200, { roomKey: MOCK_ROOM_KEY });
