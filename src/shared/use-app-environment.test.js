jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import * as asyncStorage from "../utilities/async-storage";
import { useAppEnvironment } from "./use-app-environment";
import * as newDeviceKey from "./use-app-state/new-device-key";

describe("use-app-environment", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the expected properties", async () => {
    let appState = null;
    const MockComponent = () => {
      appState = useAppEnvironment();
      return null;
    };

    const mockDeviceId = "TytTZsOemBfoUa7--1618670819289";
    jest.spyOn(newDeviceKey, "newDeviceKey").mockReturnValue(mockDeviceId);

    render(<MockComponent />);

    await waitFor(() => {
      expect(appState).toEqual({
        isLoading: false,
        environment: "test",
        deviceId: mockDeviceId,
      });
    });
  });

  it("gets a new device id and saves it if the device Id is not saved already", async () => {
    let appState = null;

    const newDeviceId = "newDeviceId";
    jest.spyOn(newDeviceKey, "newDeviceKey").mockReturnValue(newDeviceId);
    jest.spyOn(asyncStorage.deviceId, "save");

    const MockComponent = () => {
      appState = useAppEnvironment();
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
      appState = useAppEnvironment();
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
