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

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import React from "React";
import { Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";
import * as vibrationPatterns from "./src/utilities/vibration-patterns";

describe("App - Vibrate on current phone", () => {
  beforeEach(() => {
    Vibration.vibrate.mockClear();
    Vibration.cancel.mockClear();
  });

  it("allows the user to play a vibration pattern", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    // 1. goes to expected page
    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    // 2. Find the button to press
    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    // 3. Confirm the vibration icon is not showing before pressing the button
    expect(
      within(exampleConstantVibrationButton).queryByTestId("vibrateIcon")
    ).toBe(null);

    // 4. Press the button
    act(() => fireEvent.press(exampleConstantVibrationButton));

    // 5. Confirm vibration has started
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );

    // 6. Confirm the vibration icon is showing after pressing the button
    expect(
      within(exampleConstantVibrationButton).queryByTestId("vibrateIcon")
    ).toBeDefined();
  });

  it("plays a second pattern when selects a different one after a first is active", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const constantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    // 1. Press first pattern
    act(() => fireEvent.press(constantVibrationButton));
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Constant"].pattern,
      true
    );

    const pulseVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Pulse"));

    // 1. Press second pattern
    act(() => fireEvent.press(pulseVibrationButton));
    expect(Vibration.vibrate).toHaveBeenCalledTimes(2);
    expect(Vibration.vibrate).toHaveBeenCalledWith(
      vibrationPatterns.patterns["Pulse"].pattern,
      true
    );
  });

  it("stops vibrating when same option is selected twice", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    // Assert vibration starts on the first press
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    // Assert vibration stops on the second press
    Vibration.cancel.mockClear();
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);
  });

  it("creates a new random pattern when the 'Random' option is selected", async () => {
    const mockPattern = newVibrationPattern("mockRandom", [1, 1, 1]);
    const spyOfNewRandomPattern = jest
      .spyOn(vibrationPatterns, "newRandomPattern")
      .mockReturnValue(mockPattern);

    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) =>
      within(option).queryByText(vibrationPatterns.RANDOM_PATTERN_NAME)
    );

    act(() => fireEvent.press(exampleConstantVibrationButton));

    await waitFor(() => {
      // Assert a new random pattern was created
      expect(spyOfNewRandomPattern).toHaveBeenCalledTimes(1);
      // Assert vibration has started
      expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
      // Assert the correct pattern was used with vibrate
      expect(Vibration.vibrate).toHaveBeenCalledWith(
        mockPattern.pattern.map((time) => time),
        true
      );
    });
  });

  it("saves the current vibration pattern name when returning to the main menu", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    await act(async () => fireEvent.press(exampleConstantVibrationButton));

    const backButton = getAllByRole("button").find((option) =>
      within(option).queryByTestId("arrowBackSharpIcon")
    );

    AsyncStorage.setItem.mockClear();
    await act(async () => fireEvent.press(backButton));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "LAST_ACTIVE_LOCAL_VIBRATION",
        '{"name":"Constant","pattern":[0,9007199254740991000],"runTime":9007199254740991000}'
      );
    });
  });

  it("loads the current vibration pattern when returning to 'Vibrate on current phone'", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    // 1. Start a vibration pattern
    await act(async () => fireEvent.press(exampleConstantVibrationButton));
    const backButton = getAllByRole("button").find((option) =>
      within(option).queryByTestId("arrowBackSharpIcon")
    );

    AsyncStorage.setItem.mockClear();
    // 2. Move off the current page back to the main menu
    await act(async () => fireEvent.press(backButton));

    // 3. Confirm pattern was saved
    const expectedSavedData =
      '{"name":"Constant","pattern":[0,9007199254740991000],"runTime":9007199254740991000}';
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "LAST_ACTIVE_LOCAL_VIBRATION",
        expectedSavedData
      );

      AsyncStorage.getItem.mockClear();
      AsyncStorage.getItem.mockResolvedValue(expectedSavedData);
    });

    // 4. Return to current page
    moveToVibrateOnCurrentPhonePage(getAllByRole);

    // 5. See that the last pattern is loaded
    Vibration.vibrate.mockClear();
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "LAST_ACTIVE_LOCAL_VIBRATION"
      );
      expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
      expect(Vibration.vibrate).toHaveBeenCalledWith(
        vibrationPatterns.patterns["Constant"].pattern,
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

  return act(() => fireEvent.press(makeCurrentPhoneVibrateButton));
};
