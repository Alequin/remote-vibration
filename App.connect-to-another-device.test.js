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

import { act, fireEvent, render, within } from "@testing-library/react-native";
import React from "React";
import { Vibration } from "react-native";
import { AppRouter } from "./App";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";

newVibrationPattern;

describe("App - Vibrate on current phone", () => {
  beforeEach(() => {
    Vibration.vibrate.mockClear();
    Vibration.cancel.mockClear();
  });

  it("allows the users to go to the 'vibrate on current phone' page from the 'main menu'", async () => {
    const { getAllByRole, getByTestId } = render(<AppRouter />);

    // Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    moveToConnectToAnotherDevicePage(getAllByRole);

    // Moves to expected page
    expect(getByTestId("connect-to-another-device-page")).toBeDefined();
  });
});

const moveToConnectToAnotherDevicePage = (getAllByRole) => {
  const menuButtons = getAllByRole("button");

  const makeCurrentPhoneVibrateButton = menuButtons.find((button) =>
    within(button).queryByText("Connect To Another Device")
  );

  return act(() => fireEvent.press(makeCurrentPhoneVibrateButton));
};
