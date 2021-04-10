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
import * as newWebsocketClient from "./src/utilities/establish-websocket-connection/new-websocket-client";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";
import * as vibrationPatterns from "./src/utilities/vibration-patterns";
import { patterns } from "./src/utilities/vibration-patterns";

const MOCK_DEVICE_ID = "123";
const MOCK_ROOM_KEY = "234";

describe("App - send vibrations", () => {
  const mockWebsocketClient = { close: jest.fn(), send: jest.fn() };

  const establishWebsocketSpy = jest
    .spyOn(newWebsocketClient, "newWebsocketClient")
    .mockReturnValue(mockWebsocketClient);

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

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(getByTestId("send-vibrations-page")).toBeDefined();

      expect(getByTestId("loadingIndicator")).toBeDefined();
    });
  });

  it("creates a new connection on visiting the 'send-vibration' page", async () => {
    const createARoomInterceptor = mockCreateARoom();

    const { findByText, getByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
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

    // 6. Confirm a message is send to connect to the new room
    expect(mockWebsocketClient.send).toHaveBeenCalledTimes(1);
    expect(mockWebsocketClient.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "connectToRoom",
        data: { roomKey: MOCK_ROOM_KEY },
      })
    );

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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
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

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press play on a vibration pattern
    const exampleConstantVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).getByText("Constant"));

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

  it("creates a new random pattern when the 'Random' option is selected", async () => {
    jest.spyOn(Clipboard, "setString");
    const createARoomInterceptor = mockCreateARoom();

    const mockPattern = newVibrationPattern("mockRandom", [1, 1, 1]);
    const spyOfNewRandomPattern = jest
      .spyOn(vibrationPatterns, "newRandomPattern")
      .mockReturnValue(mockPattern);

    const { findByText, findAllByTestId, findByTestId, getAllByRole } = render(
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(`Password:`));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

    // 4. Press play on a vibration pattern
    const exampleRandomVibrationButton = (
      await findAllByTestId("vibration-pattern-option")
    ).find((button) => within(button).queryByText("Random"));

    await act(async () => fireEvent.press(exampleRandomVibrationButton));

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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
      createARoomInterceptor,
      establishWebsocketSpy,
      mockWebsocketClient
    );

    // 3. Confirm connection is established
    expect(await findByText(/Password/i));
    expect(await findByText(`${MOCK_ROOM_KEY}`));

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
      <AppRouter appState={{ deviceId: MOCK_DEVICE_ID, isAppActive: true }} />
    );

    await waitFor(async () => {
      // 1. Starts on main menu
      expect(await findByTestId("main-menu-page")).toBeDefined();

      await moveToSendVibrationsPage(getAllByRole);

      // 2. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
    });

    await mockCallsToCreateConnection(
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

      await moveToSendVibrationsPage(getAllByRole);

      // 3. Moves to expected page
      expect(await findByTestId("send-vibrations-page")).toBeDefined();
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
    });

    await waitForExpect(async () => {
      // 8. re-connects to the websocket
      expect(establishWebsocketSpy).toHaveBeenCalled();
    });
  });
});

const moveToSendVibrationsPage = async (getAllByRole) => {
  const mainMenuButtons = getAllByRole("button");

  const sendVibrationsButton = mainMenuButtons.find((button) =>
    within(button).queryByText(pageNames.sendVibrations)
  );

  await act(async () => fireEvent.press(sendVibrationsButton));
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

  await waitForExpect(async () => {
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

  // 5. Fake receiving a message confirming the room connection
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
