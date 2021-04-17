jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

jest.mock("react-native/Libraries/AppState/AppState", () => {
  let currentState = "active";
  return {
    currentState,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});

jest.mock("expo-constants", () => ({
  sessionId: "123",
}));

import { AppState, Vibration } from "react-native";
import { act, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { useAppState } from "./use-app-state";
import { ACTIVE_APP_STATE } from "./use-app-state/is-state-active";
import * as newDeviceKey from "./use-app-state/new-device-key";
import * as asyncStorage from "../utilities/async-storage";

describe("use-app-state", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the expected properties", async () => {
    let appState = null;
    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    const mockDeviceId = "TytTZsOemBfoUa7--1618670819289";
    jest.spyOn(newDeviceKey, "newDeviceKey").mockReturnValue(mockDeviceId);

    render(<MockComponent />);

    await waitFor(() => {
      expect(appState).toEqual({
        isLoading: false,
        isAppActive: true,
        appState: ACTIVE_APP_STATE,
        isNewSession: true,
        sessionId: "123",
        deviceId: mockDeviceId,
      });
    });
  });

  it("updates the appState when an app state event fires", async () => {
    let appState = null;

    let appStateChangeCallback = null;
    AppState.addEventListener.mockImplementation((_, callback) => {
      appStateChangeCallback = callback;
    });

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Confirm state starts as active for hook complete state changes
    expect(appState.appState).toBe(ACTIVE_APP_STATE);

    // 3. Update app state
    await act(async () => appStateChangeCallback("background"));

    // 4.Confirm the hook caused the state to change
    expect(appState.appState).toBe("background");
  });

  it("clears the saved vibration pattern when the app stops being active", async () => {
    let appState = null;

    let appStateChangeCallback = null;
    AppState.addEventListener.mockImplementation((_, callback) => {
      appStateChangeCallback = callback;
    });

    jest.spyOn(asyncStorage.lastActiveVibrationPattern, "clear");

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Update app state
    await act(async () => appStateChangeCallback("background"));

    // 3. Confirm the hook caused the state to change
    expect(appState.appState).toBe("background");

    // 4. Confirm the saved vibration pattern is cleared
    expect(asyncStorage.lastActiveVibrationPattern.clear).toHaveBeenCalledTimes(
      1
    );
  });

  it("cancels all vibrations when the app is not active", async () => {
    let appState = null;

    let appStateChangeCallback = null;
    AppState.addEventListener.mockImplementation((_, callback) => {
      appStateChangeCallback = callback;
    });

    jest.spyOn(Vibration, "cancel");

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 3. Update app state
    await act(async () => appStateChangeCallback("background"));

    // 4.Confirm the hook caused the state to change
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });

  it("saves the session Id if the session is new", async () => {
    let appState = null;

    jest.spyOn(asyncStorage.sessionId, "save");

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Confirm the session is new
    expect(appState.isNewSession).toBe(true);

    // 3. Confirm the session Id is saved
    expect(asyncStorage.sessionId.save).toHaveBeenCalledTimes(1);
    expect(asyncStorage.sessionId.save).toHaveBeenCalledWith("123");
  });

  it("identifies the session is new if the saved session id matches the current session id", async () => {
    let appState = null;

    // 1. Pretend the session is old by returning the mock session Id
    jest.spyOn(asyncStorage.sessionId, "read").mockResolvedValue("123");

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Confirm the session is not new
    expect(appState.isNewSession).toBe(false);
  });

  it("gets an new id and saves it if the device Id is not saved already", async () => {
    let appState = null;

    const newDeviceId = "newDeviceId";
    jest.spyOn(newDeviceKey, "newDeviceKey").mockReturnValue(newDeviceId);
    jest.spyOn(asyncStorage.deviceId, "save");

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Confirm the device Id is saved
    expect(asyncStorage.deviceId.save).toHaveBeenCalledTimes(1);
    expect(asyncStorage.deviceId.save).toHaveBeenCalledWith(newDeviceId);

    // 3. Confirm the device Id matches the new one
    expect(appState.deviceId).toBe(newDeviceId);
  });

  it("loads the stored device id if one is available", async () => {
    let appState = null;

    const storedDeviceId = "storedDeviceId";
    jest.spyOn(asyncStorage.deviceId, "read").mockResolvedValue(storedDeviceId);

    const MockComponent = () => {
      appState = useAppState();
      return null;
    };

    render(<MockComponent />);

    // 1. Wait for hook to complete state changes
    await waitFor(() => {
      expect(appState.isLoading).toBe(false);
    });

    // 2. Confirm the device Id matches the stored one
    expect(appState.deviceId).toBe(storedDeviceId);
  });
});
