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

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import Clipboard from "expo-clipboard";
import nock from "nock";
import React from "React";
import { Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - receive vibrations", () => {
  const mockWebsocketClient = { close: jest.fn(), send: jest.fn() };

  const establishWebsocketSpy = jest
    .spyOn(newWebsocketClient, "newWebsocketClient")
    .mockReturnValue(mockWebsocketClient);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("shows the full page error if there is an error connecting to the websocket", async () => {
    mockCreateARoom();

    const { getByTestId, findAllByRole, getByText } = render(
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

    // 3. Fake the failure to connect to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await waitFor(() => mockWebsocketClient.onerror("unable to connect"));

    // 4. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it.todo(
    "returns the user to the menu from the error page when the button is pressed"
  );

  it("shows a text input to allow the user to request a connection to a room", async () => {
    mockCreateARoom();

    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page
    await moveToReceiveVibrationsPage(findAllByRole);
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. Confirms an input is available
    expect(getByPlaceholderText("Password")).toBeDefined();
  });

  it("allows the user to clear the text in the connection input", async () => {
    mockCreateARoom();

    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. Confirms an input is available
    expect(getByPlaceholderText("Password")).toBeDefined();

    // 5. Enter a password
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Password"), "fake password")
    );
    expect(
      within(getByPlaceholderText("Password")).queryByText("fake password")
    );

    // 6. Press the clear text button
    await act(async () => fireEvent.press(getByTestId("cancelIcon")));

    // 7. Confirm the input was cleared
    const input = getByPlaceholderText("Password");
    expect(within(input).queryByText("fake password")).toBeNull();
    expect(within(input).queryByText("")).toBeDefined();
  });

  it("allows the user to paste a password and override the current input", async () => {
    mockCreateARoom();

    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. Confirms an input is available
    expect(getByPlaceholderText("Password")).toBeDefined();

    // 5. Enter a password
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Password"), "fake password")
    );
    expect(
      within(getByPlaceholderText("Password")).queryByText("fake password")
    );

    // 6. Press the paste text button
    jest
      .spyOn(Clipboard, "getStringAsync")
      .mockResolvedValue("pasted password");
    await act(async () => fireEvent.press(getByTestId("contentPasteIcon")));

    // 7. Confirm the input was updated
    const input = getByPlaceholderText("Password");
    expect(within(input).queryByText("fake password")).toBeNull();
    expect(within(input).queryByText("pasted password")).toBeDefined();
  });

  it("disables the connect button if the text input is empty", async () => {
    mockCreateARoom();

    const { getByTestId, getAllByRole, findAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. Confirm the button is disabled
    expect(
      getAllByRole("button").find((button) =>
        within(button).queryByText("Connect")
      )
    ).toBeDisabled();
  });

  it("enables the connect button when the user enters anything into the input", async () => {
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
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Password"), "mockKey")
    );

    // 5. Confirm the button is enabled
    expect(
      getAllByRole("button").find((button) =>
        within(button).queryByText("Connect")
      )
    ).toBeEnabled();
  });

  it("make a request to connect to a room when the connect button is pressed", async () => {
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
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );
  });

  it("shows an error message when the room password cannot be found", async () => {
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
      getByText,
    } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Makes the call to open a websocket
    expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);

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

    // 7. Confirm a message is sent to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );

    // 8. Fake receiving an error message about the password not being found
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          error: "There is no room for the given key",
        }),
      })
    );

    // 9. Confirm an error message is shown
    expect(getByText(`There is no one with the password\n"${MOCK_ROOM_KEY}"`));
    expect(getByText(`Check the password is correct and try again`));
  });

  it.todo(
    "shows an error when there is an issue establishing the websocket connection"
  );

  it.todo("shows the full page error if connection is lost to the client");

  it.todo("Allows the user to reconnect to the client if connection is lost");

  it.todo("shows an error when there is an issue connecting to a room");

  it("saves the Password when the connect button is pressed", async () => {
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
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. User enters text into the input
    await act(async () =>
      fireEvent.changeText(getByPlaceholderText("Password"), MOCK_ROOM_KEY)
    );

    // 5. Submit the given key
    await act(async () =>
      fireEvent.press(
        getAllByRole("button").find((button) =>
          within(button).queryByText("Connect")
        )
      )
    );

    // 6. Makes the call to open a websocket
    expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);

    // 7. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 8. Confirm the Password is saved
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "MOST_RECENT_ROOM_KEY",
      JSON.stringify(MOCK_ROOM_KEY)
    );
  });

  it("attempts to load a saved Password when the page is mounted", async () => {
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

    // 3. Confirm the Password is saved
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("MOST_RECENT_ROOM_KEY");
  });

  it("vibrates when a vibration pattern message is received", async () => {
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

    // 3. start the connection
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Fake receiving a vibration pattern message
    const mockVibrationPattern = newVibrationPattern("mockPattern", [0.1]);
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "receivedVibrationPattern",
          data: { vibrationPattern: mockVibrationPattern, speed: 2 },
        }),
      })
    );

    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 50], true);
  });

  it("stops vibrating when an empty vibration pattern message is received", async () => {
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

    // 3. start the connection
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Fake receiving a vibration pattern message
    Vibration.cancel.mockClear();
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

  it("shows the Password when connection is established and allows it to be copied", async () => {
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      findByTestId,
      getByPlaceholderText,
      debug,
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

    // 3. start the connection
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Confirm the Password is on screen
    await waitForExpect(() => {
      const page = getByTestId("receive-vibrations-page");
      expect(within(page).queryByText(/connect to/i)).toBeDefined();
      expect(within(page).queryByText(MOCK_ROOM_KEY)).toBeDefined();
    });

    jest.spyOn(Clipboard, "setString");

    // 5. Press button to copy key
    await act(async () =>
      fireEvent.press(await findByTestId("copyConnectionKeyButton"))
    );

    // 6. Confirm the key is copied
    expect(Clipboard.setString).toHaveBeenCalledTimes(1);
    expect(Clipboard.setString).toHaveBeenCalledWith(MOCK_ROOM_KEY);
  });

  it("displays the current vibration pattern", async () => {
    mockCreateARoom();

    const {
      getByTestId,
      getAllByRole,
      getByText,
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

    // 3. start the connection
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Fake receiving a vibration pattern message
    const mockVibrationPattern = newVibrationPattern("mockPattern", [0.1]);
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "receivedVibrationPattern",
          data: { vibrationPattern: mockVibrationPattern, speed: 2 },
        }),
      })
    );

    expect(getByText("Current Vibration Pattern")).toBeDefined();
    expect(getByText(mockVibrationPattern.name)).toBeDefined();
  });
});

const moveToReceiveVibrationsPage = async (findAllByRole) => {
  const mainMenuButtons = await findAllByRole("button");

  const receiveVibrationsButton = mainMenuButtons.find((button) =>
    within(button).queryByText(pageNames.receiveVibrations)
  );

  await act(async () => fireEvent.press(receiveVibrationsButton));
};

const makeAConnection = async (
  getAllByRole,
  getByPlaceholderText,
  mockWebsocketClient
) => {
  // 1. Fake the connection to the websocket
  expect(mockWebsocketClient.onopen).toBeDefined();
  await act(async () => mockWebsocketClient.onopen());

  // 2. User enters text into the input
  await act(async () =>
    fireEvent.changeText(getByPlaceholderText("Password"), MOCK_ROOM_KEY)
  );

  // 3. Submit the given key
  await act(async () =>
    fireEvent.press(
      getAllByRole("button").find((button) =>
        within(button).queryByText("Connect")
      )
    )
  );

  // 4. Fake receiving a message confirming the room connection
  await act(async () =>
    mockWebsocketClient.onmessage({
      data: JSON.stringify({
        type: "confirmRoomConnection",
      }),
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
