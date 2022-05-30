jest.mock("expo-keep-awake", () => ({
  activateKeepAwake: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));
jest.mock("react-native/Libraries/AppState/AppState", () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
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
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));
jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import "@testing-library/jest-native/extend-expect";
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import * as Network from "expo-network";
import nock from "nock";
import React from "React";
import { Alert, AppState, Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - receive vibrations", () => {
  let mockWebsocketClient = null;

  const establishWebsocketSpy = jest.spyOn(
    newWebsocketClient,
    "newWebsocketClient"
  );
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebsocketClient = { close: jest.fn(), send: jest.fn() };
    establishWebsocketSpy.mockReturnValue(mockWebsocketClient);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it("shows the message explaining what to do on the receive-vibrations-page", async () => {
    const { getByTestId, findAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page
    await moveToReceiveVibrationsPage(findAllByRole);
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Confirms message appears as expected
    expect(
      getByText("Enter another person's password to receive vibrations")
    ).toBeDefined();
  });

  it("shows a text input to allow the user to request a connection to a room", async () => {
    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
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
    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
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
    expect(getByPlaceholderText("Password").props.value).toBe("fake password");

    // 6. Press the clear text button
    await act(async () => fireEvent.press(getByTestId("cancelIcon")));

    // 7. Confirm the input was cleared
    const input = getByPlaceholderText("Password");
    expect(input.props.value).toBe("");
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      "MOST_RECENT_ROOM_KEY"
    );
  });

  it("allows the user to paste a password and override the current input", async () => {
    const { getByTestId, findAllByRole, getByPlaceholderText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
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
    const { getByTestId, getAllByRole, findAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
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
    const { getByTestId, getAllByRole, findAllByRole, getByPlaceholderText } =
      render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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
  });

  it("shows an error message when the room password cannot be found", async () => {
    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
      getByText,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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
        data: { password: MOCK_ROOM_KEY },
      })
    );

    // 8. Fake receiving an error message about the password not being found
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          error: "password does not exist",
        }),
      })
    );

    // 9. Confirm an error message is shown
    expect(Alert.alert.mock.calls[0][0]).toBe("Sorry there was an issue");
    expect(Alert.alert.mock.calls[0][1]).toBe(
      `There is no one with the password "${MOCK_ROOM_KEY}".\n\nCheck the password is correct and try again`
    );
  });

  it("shows the full page error if there is an error connecting to the websocket", async () => {
    const { getByTestId, findAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);
    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the failure to connect to the websocket
    expect(mockWebsocketClient.onerror).toBeDefined();
    await act(async () => mockWebsocketClient.onerror("unable to connect"));

    // 4. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("shows the full page error if connection is lost to the client", async () => {
    const {
      getByTestId,
      findAllByRole,
      getAllByRole,
      getByText,
      getByPlaceholderText,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to connect to the room
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Fake client disconnection
    expect(mockWebsocketClient.onclose).toBeDefined();
    await act(async () => mockWebsocketClient.onclose());

    // 5. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("checks for an internet connection when there is an issue with the client and lets the user know when not connected", async () => {
    jest
      .spyOn(Network, "getNetworkStateAsync")
      .mockResolvedValue({ isConnected: false, isInternetReachable: false });

    const { getByTestId, findAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);
    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the failure to connect to the websocket
    expect(mockWebsocketClient.onerror).toBeDefined();
    await act(async () => mockWebsocketClient.onerror("unable to connect"));

    // 4. Confirm the internet connection is checked
    expect(Network.getNetworkStateAsync).toHaveBeenCalledTimes(1);

    // 5. Confirm the error message about a lack of internet is shown
    expect(
      getByText("It looks like you might not be connected to the internet")
    ).toBeDefined();
  });

  it("Allows the user to reconnect to the client if connection is lost", async () => {
    const {
      getByTestId,
      findAllByRole,
      getAllByRole,
      getByText,
      getByPlaceholderText,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToReceiveVibrationsPage(findAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to connect to the room
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Fake client disconnection
    expect(mockWebsocketClient.onclose).toBeDefined();
    await act(async () => mockWebsocketClient.onclose());

    // 5. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();

    // 6. Return new client object so react hook dependencies work as expected
    const secondMockWebsocketClient = { close: jest.fn(), send: jest.fn() };
    newWebsocketClient.newWebsocketClient.mockReturnValue(
      secondMockWebsocketClient
    );

    // 7. press the reconnect button
    const reconnectButton = getAllByRole("button").find((button) =>
      within(button).queryByText("Try to Reconnect")
    );
    await act(async () => fireEvent.press(reconnectButton));

    // 8. Confirm the client connection is being made again
    await waitForExpect(async () => {
      // 8.1. Make the call to open a websocket
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(2);
    });

    // 8.2. Fake the connection to the websocket
    expect(secondMockWebsocketClient.onopen).toBeDefined();
    await act(async () => secondMockWebsocketClient.onopen());

    // 9. Confirm the page has loaded
    await waitForExpect(() => {
      expect(getByPlaceholderText("Password")).toBeDefined();
    });
  });

  it("saves the Password when the connect button is pressed", async () => {
    const { getByTestId, getAllByRole, findAllByRole, getByPlaceholderText } =
      render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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

    // 3. Confirm the Password is saved
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("MOST_RECENT_ROOM_KEY");
  });

  it("vibrates when a vibration pattern message is received", async () => {
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
    const {
      getByTestId,
      getAllByRole,
      findAllByRole,
      findByTestId,
      getByPlaceholderText,
      debug,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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

    jest.spyOn(Clipboard, "setStringAsync");

    // 5. Press button to copy key
    await act(async () =>
      fireEvent.press(await findByTestId("copyPasswordButton"))
    );

    // 6. Confirm the key is copied
    expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(1);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(MOCK_ROOM_KEY);
  });

  it("displays the current vibration pattern", async () => {
    const {
      getByTestId,
      getAllByRole,
      getByText,
      findAllByRole,
      getByPlaceholderText,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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

  it("disconnects the websocket client when the page is unmounted", async () => {
    const { getByTestId, findAllByRole, debug } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page

    await moveToReceiveVibrationsPage(findAllByRole);

    expect(getByTestId("receive-vibrations-page")).toBeDefined();

    // 3. Fake the websocket opening

    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 4. Confirm the client has not been closed

    expect(mockWebsocketClient.close).toHaveBeenCalledTimes(0);

    // 5. Return to the main menu
    const backButton = (await findAllByRole("button")).find((button) =>
      within(button).queryByTestId("chevronBackIcon")
    );

    await act(async () => fireEvent.press(backButton));
    expect(getByTestId("main-menu-page")).toBeDefined();

    // 6. Confirm the websocket client closed the connection
    await waitForExpect(() => {
      expect(mockWebsocketClient.close).toHaveBeenCalledTimes(1);
    });
  });

  it("stops vibrating when the page is unmounted", async () => {
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

    // 5. Reset vibration.cancel to ensure it is called the expected number of times
    Vibration.cancel.mockClear();

    // 6. go back to the main menu
    deactivateKeepAwake.mockClear();
    const mainMenuButton = getAllByRole("button").find((button) =>
      within(button).queryByTestId("chevronBackIcon")
    );
    await act(async () => fireEvent.press(mainMenuButton));

    await waitForExpect(() => {
      // 7. Confirm the screen can sleep
      expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
      // 8. Confirm vibration was canceled
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });

  it("stops vibrating when the app moves to the background", async () => {
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

    // 5. Reset vibration.cancel to ensure it is called the expected number of times
    Vibration.cancel.mockClear();

    // 6. set the app as inactive
    await act(async () =>
      AppState.addEventListener.mock.calls.forEach(
        ([_, handleAppStateUpdate]) => handleAppStateUpdate("inactive")
      )
    );

    // 9. Confirm vibration was canceled
    await waitForExpect(() => {
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });

  it("allows the user to lock and unlock the screen", async () => {
    const {
      queryByTestId,
      getByTestId,
      getAllByRole,
      findAllByRole,
      getByPlaceholderText,
    } = render(<AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />);

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

    // 4. Presses the lock screen button
    const lockButton = getAllByRole("button").find((buttons) =>
      within(buttons).queryByText("Lock The Screen")
    );
    await act(async () => fireEvent.press(lockButton));

    // 5. Confirms the lock screen contains the expected content
    expect(queryByTestId("receive-vibrations-page")).toBeNull();
    const lockScreen = getByTestId("lock-screen");
    expect(within(lockScreen).getByText("Lock Screen")).toBeDefined();
    expect(within(lockScreen).getByTestId("lockIcon")).toBeDefined();
    expect(
      within(lockScreen).getByText(/Press the screen.*to unlock/i)
    ).toBeDefined();

    // 6. user presses the screen enough times to unlock it
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));

    // 7. user is returned to the main vibration screen
    await waitForExpect(async () =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );
  }, 10000);

  it("resets the lock screen if the user does not press it the total required times", async () => {
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

    // 3. start the connection
    await makeAConnection(
      getAllByRole,
      getByPlaceholderText,
      mockWebsocketClient
    );

    // 4. Presses the lock screen button
    const lockButton = getAllByRole("button").find((buttons) =>
      within(buttons).queryByText("Lock The Screen")
    );
    await act(async () => fireEvent.press(lockButton));

    // 5. user presses the screen but does not unlock it
    const lockScreen = getByTestId("lock-screen");
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    expect(within(lockScreen).queryAllByTestId("active-lock-dot")).toHaveLength(
      4
    );

    // 6. wait for the press count to reduce to zero
    await waitForExpect(() => {
      expect(
        within(lockScreen).queryAllByTestId("active-lock-dot")
      ).toHaveLength(0);
    });

    // 5. user can press the screen multiple times again and unlock
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));

    await waitForExpect(() =>
      expect(getByTestId("receive-vibrations-page")).toBeDefined()
    );
  }, 30000); // delay so the active-lock-dot count can reduce organically

  it("vibrates when a vibration pattern message is received", async () => {
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

    // 5. Confirm the screen has been instructed to stay awake
    expect(activateKeepAwake).toHaveBeenCalledTimes(1);

    // 6. Fake receiving a vibration pattern message
    Vibration.cancel.mockClear();
    deactivateKeepAwake.mockClear();
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "receivedVibrationPattern",
          data: { vibrationPattern: null },
        }),
      })
    );
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);

    // 7. Confirm the screen has been instructed to no longer stay awake
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
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
