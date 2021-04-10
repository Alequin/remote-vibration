jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");
jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

import React from "React";
import { render, waitFor } from "@testing-library/react-native";
import App from "./App";
import * as newDeviceKey from "./src/utilities/new-device-key";

describe("App", () => {
  it("creates a new device key when one does not exist", async () => {
    const newDeviceKeySpy = jest
      .spyOn(newDeviceKey, "newDeviceKey")
      .mockReturnValue("123");

    render(<App />);

    await waitFor(() => {
      expect(newDeviceKeySpy).toHaveBeenCalledTimes(1);
    });
  });
});
