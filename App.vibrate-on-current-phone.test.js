// hides warning about module which cannot be used in tests
jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");
jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

import React from "React";
import {
  fireEvent,
  render,
  within,
  act,
  waitFor,
} from "@testing-library/react-native";
import App from "./App";

import { Vibration } from "react-native";

describe("App - Vibrate on current phone", () => {
  beforeEach(() => {
    Vibration.vibrate.mockClear();
    Vibration.cancel.mockClear();
  });

  it("allows the users to go to the 'vibrate on current phone' page from the 'main menu'", () => {
    const { getAllByRole, getByTestId } = render(<App />);

    // Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    // Moves to expected page
    // expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();
  });

  it.todo("shows the expected buttons");

  it("allows the user to play a vibration pattern", () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<App />);

    act(() => moveToVibrateOnCurrentPhonePage(getAllByRole));

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const constantVibrationOption = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    const exampleConstantVibrationButton = within(constantVibrationOption)
      .getAllByRole("button")
      .find((button) => within(button).getByTestId("playIcon"));

    act(() => fireEvent.press(exampleConstantVibrationButton));

    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
  });

  it("stop vibrating when moving of the page 'vibrate on current phone'", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<App />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    const backButton = getByTestId("backArrowIcon");

    // Start vibrating
    const constantVibrationOption = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));
    const exampleConstantVibrationButton = within(constantVibrationOption)
      .getAllByRole("button")
      .find((button) => within(button).getByTestId("playIcon"));
    act(() => fireEvent.press(exampleConstantVibrationButton));

    // confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    // Confirm vibration has not being stopped yet
    expect(Vibration.cancel).toHaveBeenCalledTimes(0);

    // Returns to main menu
    fireEvent.press(backButton);

    waitFor(() => {
      // Confirm the page is the main menu
      expect(getByTestId("main-menu-page")).toBeDefined();
      // Confirm stop has been called
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });
});

const moveToVibrateOnCurrentPhonePage = (getAllByRole) => {
  const menuButtons = getAllByRole("button");

  const makeCurrentPhoneVibrateButton = menuButtons.find((button) =>
    within(button).queryByText("Vibrate On Current Phone")
  );

  act(() => fireEvent.press(makeCurrentPhoneVibrateButton));
};
