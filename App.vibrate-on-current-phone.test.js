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
import * as vibrationPatterns from "./src/shared/vibration-patterns";
import { newVibrationPattern } from "./src/shared/new-vibration-pattern";

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

    moveToVibrateOnCurrentPhonePage(getAllByRole);

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

  it("stops vibrating when moving off the page 'vibrate on current phone'", async () => {
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

    // Assert vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    // Assert vibration has not being stopped yet
    expect(Vibration.cancel).toHaveBeenCalledTimes(0);

    // Returns to main menu
    fireEvent.press(backButton);

    waitFor(() => {
      // Assert the page is the main menu
      expect(getByTestId("main-menu-page")).toBeDefined();
      // Assert stop has been called
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });

  it("stops vibrating when same option is selected twice", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<App />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const constantVibrationOption = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    const exampleConstantVibrationButton = within(constantVibrationOption)
      .getAllByRole("button")
      .find((button) => within(button).getByTestId("playIcon"));

    // Assert vibration starts on the first press
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    // Assert vibration stops on the second press
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });

  it("creates a new random pattern when the 'Random' option is selected", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<App />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const constantVibrationOption = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) =>
      within(option).queryByText(vibrationPatterns.RANDOM_PATTERN_NAME)
    );

    const exampleConstantVibrationButton = within(constantVibrationOption)
      .getAllByRole("button")
      .find((button) => within(button).getByTestId("playIcon"));

    act(() => fireEvent.press(exampleConstantVibrationButton));

    const mockPattern = newVibrationPattern("mockRandom", [1, 1, 1]);

    // Assert a random pattern was created
    const spyOfNewRandomPattern = jest
      .spyOn(vibrationPatterns, "newRandomPattern")
      .mockReturnValue(mockPattern);

    waitFor(() => {
      // Assert a new random pattern was created
      expect(spyOfNewRandomPattern).toHaveBeenCalledTimes(1);

      // Assert vibration has started
      expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

      // Assert the correct pattern was used with vibrate
      expect(Vibration.vibrate).toHaveBeenCalledWith(
        mockPattern.map((time) => time * 1000),
        true
      );
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
