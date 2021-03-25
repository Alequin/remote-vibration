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

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import Clipboard from "expo-clipboard";
import nock from "nock";
import React, { useState } from "React";
import { TouchableOpacity } from "react-native-gesture-handler";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";
import * as establishWebsocketConnection from "./src/utilities/establish-websocket-connection";
import { patterns } from "./src/utilities/vibration-patterns";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - Create a new connection", () => {
  const mockWebsocketClient = { close: jest.fn(), send: jest.fn() };

  const establishWebsocketSpy = jest
    .spyOn(establishWebsocketConnection, "establishWebsocketConnection")
    .mockImplementation(() => mockWebsocketClient);

  beforeEach(() => {
    establishWebsocketSpy.mockClear();
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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
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
  });

  it("sends a vibration pattern when one is selected", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
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

    // 4. Press play on a vibration pattern
    const constantVibration = (
      await findAllByTestId("vibration-pattern-option")
    ).find((option) => within(option).queryByText("Constant"));

    const exampleConstantVibrationButton = within(constantVibration)
      .getAllByRole("button")
      .find((button) => within(button).getByTestId("playIcon"));

    await act(async () => fireEvent.press(exampleConstantVibrationButton));

    // 5. Confirm the pattern was sent
    expect(mockWebsocketClient.send).toHaveBeenCalled();
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: patterns["Constant"],
          speed: 1,
        },
      })
    );
  });

  it.only("reconnects to the server when the state changes from inactive to active", async () => {
    mockCreateARoom();

    // 1. Create buttons to allow mocking of changing app state
    const TestComponent = () => {
      const [mockAppState, setMockAppState] = useState({
        deviceId: MOCK_DEVICE_ID,
        isAppActive: true,
      });

      return (
        <>
          <AppRouter appState={mockAppState} />

          <TouchableOpacity
            testID="setAppActive"
            onPress={() =>
              setMockAppState({ ...mockAppState, isAppActive: true })
            }
          />
          <TouchableOpacity
            testID="setAppInactive"
            onPress={() =>
              setMockAppState({ ...mockAppState, isAppActive: false })
            }
          />
        </>
      );
    };

    const { findByTestId, getByTestId, getAllByRole } = render(
      <TestComponent />
    );

    await waitFor(async () => {
      // 2. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToCreateAConnectionPage(getAllByRole);

      // 3. Moves to expected page
      expect(await findByTestId("create-a-connection-page")).toBeDefined();
    });

    // 4. set the app as inactive
    const inactiveButton = await findByTestId("setAppInactive");
    await act(async () => fireEvent.press(inactiveButton));

    // 5. create a fresh mock to intercept connection to server
    const createARoomInterceptor = mockCreateARoom();

    // 6. set the app as active
    const activeButton = await findByTestId("setAppActive");
    await act(async () => fireEvent.press(activeButton));

    await waitForExpect(async () => {
      // 7. re-connects to the room
      expect(createARoomInterceptor.isDone()).toBe(true);
      // 8. re-connects to the websocket
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });
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
