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
  "./src/pages/send-vibrations/hide-loading-indicator-interval",
  () => ({
    hideLoadingIndicatorInterval: () => 0,
  })
);
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import nock from "nock";
import React from "React";
import { Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";
import * as establishWebsocketConnection from "./src/utilities/establish-websocket-connection";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - receive vibrations", () => {
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

  it("shows a text input to allow the user to request a connection to a room", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. Confirms an input is available
    await waitForExpect(() =>
      expect(getByPlaceholderText("Enter a key")).toBeDefined()
    );
  });

  it("disables the connect button if the text input is empty", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const { getByTestId, getAllByRole, findAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. Confirm the button is disabled
    expect(
      getAllByRole("button").find((button) =>
        within(button).queryByText("Connect")
      )
    ).toBeDisabled();
  });

  it("enables the connect button when the user enters anything into the input", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Enter a key"), "mockKey")
    );

    // 4. Confirm the button is enabled
    expect(
      getAllByRole("button").find((button) =>
        within(button).queryByText("Connect")
      )
    ).toBeEnabled();
  });

  it("make a request to connect to a room when the connect button is pressed", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Enter a key"), MOCK_ROOM_KEY)
    );

    // 4. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 5. Makes the call to open a websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 6. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 7. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );
  });

  it.todo("handles the message received message on connect");

  it("saves the connection key when the connect button is pressed", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Enter a key"), MOCK_ROOM_KEY)
    );

    // 4. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 5. Makes the call to open a websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 6. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 7. Confirm the connection key is saved
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "MOST_RECENT_ROOM_KEY",
      MOCK_ROOM_KEY
    );
  });

  it("attempts to load a saved connection key when the page is mounted", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. Confirm the connection key is saved
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("MOST_RECENT_ROOM_KEY");
  });

  it("vibrates when a vibration pattern message is received", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Enter a key"), MOCK_ROOM_KEY)
    );

    // 4. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 5. Makes the call to open a websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 6. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 7. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );

    // 8. Fake receiving a vibration pattern message
    expect(mockWebsocketClient.onopen).toBeDefined();
    const mockVibrationPattern = newVibrationPattern("mockPattern", [0.1]);
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "receivedVibrationPattern",
          data: { vibrationPattern: mockVibrationPattern },
        }),
      })
    );

    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 100], true);
  });

  it("stops vibrating when an empty vibration pattern message is received", async () => {
    // 1. Delay the time to complete the api request
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    await waitForExpect(() =>
      expect(getByTestId("main-menu-page")).toBeDefined()
    );

    await waitFor(async () => moveToReceiveVibrationsPage(findAllByRole));

    // 2. Moves to expected page
    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );

    // 3. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Enter a key"), MOCK_ROOM_KEY)
    );

    // 4. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 5. Makes the call to open a websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
    });

    // 6. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 7. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );

    // 8. Fake receiving a vibration pattern message
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "receivedVibrationPattern",
          data: { vibrationPattern: null },
        }),
      })
    );

    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });
});

const moveToReceiveVibrationsPage = async (findAllByRole) => {
  const mainMenuButtons = await findAllByRole("button");

  const connectToAnotherDeviceButton = mainMenuButtons.find((button) =>
    within(button).queryByText("Connect To Another Device")
  );

  await act(async () => fireEvent.press(connectToAnotherDeviceButton));

  const connectToADeviceMenuButtons = await findAllByRole("button");

  const createAConnectionButton = connectToADeviceMenuButtons.find((button) =>
    within(button).queryByText(pageNames.receiveVibrations)
  );

  return await act(async () => fireEvent.press(createAConnectionButton));
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
