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

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import Clipboard from "expo-clipboard";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import * as Network from "expo-network";
import nock from "nock";
import React from "React";
import { AppState, Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import { authToken } from "./secrets.json";
import * as pageNames from "./src/pages/page-names";
import { ACTIVE_APP_STATE } from "./src/shared/use-app-state/is-state-active";
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";
import * as vibrationPatterns from "./src/utilities/vibration-patterns";
import { patterns } from "./src/utilities/vibration-patterns";

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

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Shows the loading indicator
    expect(getByTestId("loadingIndicator")).toBeDefined();
  });

  it("shows the full page error if there is an error creating a room", async () => {
    const createARoomInterceptor = mockCreateARoom({
      response: {
        status: 500,
      },
    });

    const { getByTestId, getAllByRole, getByText } = render(
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

    // 4. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("shows the full page error if there is an error with the initial websocket connection", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);

    // 5. Fake the failure to connect to the websocket
    expect(mockWebsocketClient.onerror).toBeDefined();
    await act(async () => mockWebsocketClient.onerror("unable to connect"));

    // 6. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("shows the full page error if there is an error connecting to the room", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);

    // 4. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 5. Confirm a message is sent to connect to the new room
    await waitForExpect(() => {
      expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
      expect(mockWebsocketClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: "connectToRoom",
          data: { password: MOCK_ROOM_KEY },
        })
      );
    });

    // 6. Fake receiving a message saying there is an error connecting to the room
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          error: "There is no room for the given key",
        }),
      })
    );

    // 7. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("shows the full page error if connection is lost to the client after full connection is established", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);

    // 4. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());

    // 5. Confirm a message is sent to connect to the new room
    await waitForExpect(() => {
      expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
      expect(mockWebsocketClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: "connectToRoom",
          data: { password: MOCK_ROOM_KEY },
        })
      );
    });

    // 6. Fake client disconnection
    expect(mockWebsocketClient.onclose).toBeDefined();
    await act(async () => mockWebsocketClient.onclose());

    // 7. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();
  });

  it("checks for an internet connection when there is an issue with the client and lets the user know when not connected", async () => {
    jest
      .spyOn(Network, "getNetworkStateAsync")
      .mockResolvedValue({ isConnected: false, isInternetReachable: false });

    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);

    // 4. Fake the failure to connect to the websocket
    expect(mockWebsocketClient.onerror).toBeDefined();
    await act(async () => mockWebsocketClient.onerror("unable to connect"));

    // 5. Confirm the internet connection is checked
    expect(Network.getNetworkStateAsync).toHaveBeenCalledTimes(1);

    // 6. Confirm the error message about a lack of internet is shown
    expect(
      getByText("It looks like you might not be connected to the internet")
    ).toBeDefined();
  });

  it("Allows the user to reconnect to the client if connection is lost", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { getByTestId, getAllByRole, getByText } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    await moveToSendVibrationsPage(getAllByRole);

    // 2. Moves to expected page
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Makes the call to the server to create the room
    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 4. Fake client disconnection
    expect(mockWebsocketClient.onclose).toBeDefined();
    await act(async () => mockWebsocketClient.onclose());

    // 5. Confirm the error page is shown
    expect(
      getByText("Sorry but it looks like there was a connection issue")
    ).toBeDefined();

    // 6. press the reconnect button
    const reconnectButton = getAllByRole("button").find((button) =>
      within(button).queryByText("Try to Reconnect")
    );
    await act(async () => fireEvent.press(reconnectButton));

    // 7. Confirm the client connection is made again
    await waitForExpect(async () => {
      // 7.1. Make the call to open a websocket
      expect(establishWebsocketSpy).toHaveBeenCalledTimes(2);
    });
    // 7.2. Fake the connection to the websocket
    expect(mockWebsocketClient.onopen).toBeDefined();
    await act(async () => mockWebsocketClient.onopen());
    // 7.3. Confirm a message is send to connect to the new room
    await waitForExpect(() => {
      expect(mockWebsocketClient.send).toHaveBeenCalledTimes(2);
      expect(mockWebsocketClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: "connectToRoom",
          data: { password: MOCK_ROOM_KEY },
        })
      );
    });

    // 7.4. Fake receiving a message confirming the room connection
    await act(async () =>
      mockWebsocketClient.onmessage({
        data: JSON.stringify({
          type: "confirmRoomConnection",
        }),
      })
    );

    // 8. Confirm the page has loaded
    await waitForExpect(() => {
      expect(getByText(`Password:`));
    });
  });

  it("creates a new connection on visiting the 'send-vibration' page", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, getByTestId, getAllByRole } = render(
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

    // 8. Confirm the Password is presented to the user
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));
  });

  it("allows the user to copy the Password to the clipboard", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findByTestId, getAllByRole, findAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press button to copy key
    await act(async () =>
      fireEvent.press(await findByTestId("copyPasswordButton"))
    );

    // 5. Confirm the key is copied
    expect(Clipboard.setString).toHaveBeenCalledTimes(1);
    expect(Clipboard.setString).toHaveBeenCalledWith(MOCK_ROOM_KEY);
  });

  it("sends a vibration pattern when one is selected", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    const exampleConstantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));

    // 4. Confirm the vibration icon is not showing before pressing the button
    expect(
      within(exampleConstantVibrationButton).queryByTestId("vibrateIcon")
    ).toBe(null);

    // 4. Press play on a vibration pattern
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

    // 6. Confirm the vibration icon is showing after pressing the button
    expect(
      within(exampleConstantVibrationButton).queryByTestId("vibrateIcon")
    ).toBeDefined();
  });

  it("also vibrates on the current device if check box is ticked", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press the enable vibration on device button
    const allButtons = getAllByRole("button");
    await act(async () =>
      fireEvent.press(
        allButtons.find((button) =>
          within(button).queryByText("Also vibrate on this device")
        )
      )
    );

    // 5. Press play on a vibration pattern
    const constantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));
    act(() => fireEvent.press(constantVibrationButton));

    // 6. Confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );
  });

  it("starts vibrating on the current device if check box is ticked after a vibration is selected", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press play on a vibration pattern
    const constantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));
    act(() => fireEvent.press(constantVibrationButton));

    // 5. Press the enable vibration on device button
    const allButtons = getAllByRole("button");
    await act(async () =>
      fireEvent.press(
        allButtons.find((button) =>
          within(button).queryByText("Also vibrate on this device")
        )
      )
    );

    // 6. Confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );
  });

  it("stops vibrating if vibration is enabled and then the checkbox is un-ticked", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press the enable vibration on device button
    const allButtons = getAllByRole("button");
    const enableVibrationOnDeviceButton = allButtons.find((button) =>
      within(button).queryByText("Also vibrate on this device")
    );
    await act(async () => fireEvent.press(enableVibrationOnDeviceButton));

    // 5. Press play on a vibration pattern
    const constantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));
    act(() => fireEvent.press(constantVibrationButton));

    // 6. Confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );

    // 7. Disable vibration on current device
    Vibration.cancel.mockClear();
    await act(async () => fireEvent.press(enableVibrationOnDeviceButton));

    // 8. Confirm vibration has stopped
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });

  it("creates a new random pattern when the 'Random' option is selected", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const mockPattern = newVibrationPattern("mockRandom", [1, 1, 1]);

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press play on a vibration pattern
    const spyOfNewRandomPattern = jest
      .spyOn(vibrationPatterns, "newRandomPattern")
      .mockReturnValue(mockPattern);

    const randomVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).queryByText("Random"));

    await act(async () => fireEvent.press(randomVibrationButton));

    // 5. Confirm the random pattern was sent
    expect(spyOfNewRandomPattern).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalled();
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: mockPattern,
          speed: 1,
        },
      })
    );
  });

  it("sends an empty vibration pattern when one deselected to signify the vibration should stop", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(await findByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page
    await moveToSendVibrationsPage(getAllByRole);
    expect(await findByTestId("send-vibrations-page")).toBeDefined();

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    await waitForExpect(async () => {
      expect(await findByText(/Password/i));
      expect(await findByText(`${MOCK_ROOM_KEY}`));
    });

    // 4. Press play on a vibration pattern
    const constantVibration = (
      await findAllByTestId("vibration-pattern-option")
    ).find((option) => within(option).queryByText("Constant"));

    const exampleConstantVibrationButton = within(constantVibration)
      .getAllByRole("button")
      .find((button) => within(button).getByText("Constant"));

    await act(async () => fireEvent.press(exampleConstantVibrationButton));

    // 5. Presses play on vibration pattern again to turn it off
    await act(async () => fireEvent.press(exampleConstantVibrationButton));

    // 6. Confirm the empty pattern was sent
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: null,
          speed: 1,
        },
      })
    );
  });

  it("sends a different vibration pattern if one is playing and then another is selected", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(/Password/i));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    const patternOptions = await findAllByTestId("vibration-pattern-option");

    // 4. Press play on the constant vibration pattern
    await waitFor(async () => {
      const constantVibration = patternOptions.find((option) =>
        within(option).queryByText("Constant")
      );

      const exampleConstantVibrationButton = within(constantVibration)
        .getAllByRole("button")
        .find((button) => within(button).getByText("Constant"));
      await act(async () => fireEvent.press(exampleConstantVibrationButton));
    });

    await waitFor(async () => {
      // 5. Press play on the pulse vibration pattern
      const pulseVibration = patternOptions.find((option) =>
        within(option).queryByText("Pulse")
      );

      const examplePulseVibrationButton = within(pulseVibration)
        .getAllByRole("button")
        .find((button) => within(button).getByText("Pulse"));
      await act(async () => fireEvent.press(examplePulseVibrationButton));
    });

    // 6. Confirm the empty pattern was sent
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "sendVibrationPattern",
        data: {
          vibrationPattern: patterns["Pulse"],
          speed: 1,
        },
      })
    );
  });

  it("reconnects to the server when the state changes from inactive to active", async () => {
    const initialCreateARoomInterceptor = mockCreateARoom();

    // 1. Create buttons to allow mocking of changing app state
    const { findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 2. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 3. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    // 4. confirm a call is made to create a room
    await waitForExpect(() =>
      expect(initialCreateARoomInterceptor.isDone()).toBe(true)
    );

    // 5. set the app as inactive
    await act(async () =>
      AppState.addEventListener.mock.calls.forEach(
        ([_, handleAppStateUpdate]) => handleAppStateUpdate("inactive")
      )
    );

    // 6. create a fresh mock to intercept connection to server
    const nextCreateARoomInterceptor = mockCreateARoom();

    // 7. set the app as active
    await act(async () =>
      AppState.addEventListener.mock.calls.forEach(
        ([_, handleAppStateUpdate]) => handleAppStateUpdate(ACTIVE_APP_STATE)
      )
    );

    // 8. re-connects to the room
    await waitForExpect(async () => {
      expect(nextCreateARoomInterceptor.isDone()).toBe(true);
    });

    // 9. re-connects to the websocket
    await waitForExpect(async () => {
      expect(establishWebsocketSpy).toHaveBeenCalled();
    });
  });

  it("disconnects the websocket client when the page is unmounted", async () => {
    mockCreateARoom();

    const { getByTestId, findAllByRole, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page
    await moveToSendVibrationsPage(getAllByRole);
    expect(getByTestId("send-vibrations-page")).toBeDefined();

    // 3. Fake the connection to the websocket
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
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    // 1. Starts on main menu
    expect(await findByTestId("main-menu-page")).toBeDefined();

    // 2. Moves to expected page
    await moveToSendVibrationsPage(getAllByRole);
    expect(await findByTestId("send-vibrations-page")).toBeDefined();

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press the enable vibration on device button
    const allButtons = getAllByRole("button");
    await act(async () =>
      fireEvent.press(
        allButtons.find((button) =>
          within(button).queryByText("Also vibrate on this device")
        )
      )
    );

    // 5. Press play on a vibration pattern
    const constantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));
    act(() => fireEvent.press(constantVibrationButton));

    // 6. Confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );

    // 7. Reset vibration.cancel to ensure it is called the expected number of times
    Vibration.cancel.mockClear();

    // 8. go back to the main menu
    deactivateKeepAwake.mockClear();
    const mainMenuButton = getAllByRole("button").find((button) =>
      within(button).queryByTestId("chevronBackIcon")
    );
    await act(async () => fireEvent.press(mainMenuButton));

    // 9. Confirm the screen can sleep
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);

    // 10. Confirm vibration was canceled
    await waitForExpect(() => {
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps the screen awake after a vibration has been send and allows it sleep once it has been stopped", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToMakeRoomAndCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Press play on a vibration pattern
    const constantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));
    await act(async () => fireEvent.press(constantVibrationButton));

    // 4. Confirm the pattern was sent
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

    // 5. Confirm the screen has been instructed to stay awake
    expect(activateKeepAwake).toHaveBeenCalledTimes(1);

    // 6. Press play again to stop the vibration
    deactivateKeepAwake.mockClear();
    await act(async () => fireEvent.press(constantVibrationButton));

    // 7. Confirm the screen has been instructed to no longer stay awake
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
  });
});

const moveToSendVibrationsPage = async (getAllByRole) => {
  const mainMenuButtons = getAllByRole("button");

  const sendVibrationsButton = mainMenuButtons.find((button) =>
    within(button).queryByText(pageNames.sendVibrations)
  );

  await act(async () => fireEvent.press(sendVibrationsButton));
};

const mockCallsToMakeRoomAndCreateConnection = async (
  createARoomInterceptor,
  establishWebsocketSpy,
  mockWebsocketClient
) => {
  await waitForExpect(async () => {
    // 1. Makes the call to the server to create the room
    expect(createARoomInterceptor.isDone()).toBe(true);
    // 2. Make the call to open a websocket
    expect(establishWebsocketSpy).toHaveBeenCalledTimes(1);
  });

  // 3. Fake the connection to the websocket
  expect(mockWebsocketClient.onopen).toBeDefined();
  await act(async () => mockWebsocketClient.onopen());

  // 4. Confirm a message is send to connect to the new room
  await waitForExpect(() => {
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { password: MOCK_ROOM_KEY },
      })
    );
  });

  // 5. Fake receiving a message confirming the room connection
  await act(async () =>
    mockWebsocketClient.onmessage({
      data: JSON.stringify({
        type: "confirmRoomConnection",
      }),
    })
  );
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
