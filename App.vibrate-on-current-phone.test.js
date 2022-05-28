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
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("react-native/Libraries/Vibration/Vibration", () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import React from "React";
import { Vibration } from "react-native";
import waitForExpect from "wait-for-expect";
import { AppRouter } from "./App";
import { vibrateOnCurrentDevice } from "./src/pages/page-names";
import { newVibrationPattern } from "./src/utilities/new-vibration-pattern";
import * as vibrationPatterns from "./src/utilities/vibration-patterns";

describe("App - Vibrate on current phone", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Vibration.addEventListener = jest.fn();
  });

  it("allows the user to play a vibration pattern", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentDevicePage(getAllByRole);

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

    moveToVibrateOnCurrentDevicePage(getAllByRole);

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

    moveToVibrateOnCurrentDevicePage(getAllByRole);

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

    moveToVibrateOnCurrentDevicePage(getAllByRole);

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

  it("stops vibrating and allows the screen to sleep when the page unmounts", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentDevicePage(getAllByRole);

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

    // 7. Reset vibration.cancel to ensure it is called the expected number of times
    Vibration.cancel.mockClear();

    // 8. go back to the main menu
    deactivateKeepAwake.mockClear();
    const mainMenuButton = getAllByRole("button").find((button) =>
      within(button).queryByTestId("chevronBackIcon")
    );
    await act(async () => fireEvent.press(mainMenuButton));

    // 9. Confirm the screen can sleep
    await waitForExpect(async () => {
      expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
    });

    // 10. Confirm vibration was canceled
    await waitForExpect(() => {
      expect(Vibration.cancel).toHaveBeenCalledTimes(1);
    });
  });

  it("allows the user to lock and unlock the screen", async () => {
    const { getAllByRole, getByTestId, queryByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentDevicePage(getAllByRole);

    // 1. goes to expected page
    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    // 2. Presses the lock screen button
    const lockButton = getAllByRole("button").find((buttons) =>
      within(buttons).queryByText("Lock The Screen")
    );
    await act(async () => fireEvent.press(lockButton));

    // 3. Confirms the lock screen contains the expected content
    expect(queryByTestId("vibrate-on-current-phone-page")).toBe(null);
    const lockScreen = getByTestId("lock-screen");
    expect(within(lockScreen).getByText("Lock Screen")).toBeDefined();
    expect(within(lockScreen).getByTestId("lockIcon")).toBeDefined();
    expect(
      within(lockScreen).getByText(/Press the screen.*to unlock/i)
    ).toBeDefined();

    // 4. user presses the screen enough times to unlock it
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));

    // 5. user is returned to the main vibration screen
    await waitForExpect(async () =>
      expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined()
    );
  }, 10000);

  it("resets the lock screen if the user does not press it the total required times", async () => {
    const { getAllByRole, getByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentDevicePage(getAllByRole);

    // 1. goes to expected page
    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    // 2. Presses the lock screen button
    const lockButton = getAllByRole("button").find((buttons) =>
      within(buttons).queryByText("Lock The Screen")
    );
    await act(async () => fireEvent.press(lockButton));

    // 3. user presses the screen but does not unlock it
    const lockScreen = getByTestId("lock-screen");
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    await act(async () => fireEvent.press(lockScreen));
    expect(within(lockScreen).queryAllByTestId("active-lock-dot")).toHaveLength(
      4
    );

    // 4. wait for the press count to reduce to zero
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
      expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined()
    );
  }, 30000); // delay so the active-lock-dot count can reduce organically

  it("keeps the screen awake when a vibration is playing and allows it sleep once it has stopped", async () => {
    const { getAllByRole, getByTestId, getAllByTestId } = render(<AppRouter />);

    moveToVibrateOnCurrentDevicePage(getAllByRole);

    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();

    const exampleConstantVibrationButton = getAllByTestId(
      "vibration-pattern-option"
    ).find((option) => within(option).queryByText("Constant"));

    // 1. Assert vibration starts on the first press
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    // 2. Confirm the screen has been instructed to stay awake
    expect(activateKeepAwake).toHaveBeenCalledTimes(1);

    // Assert vibration stops on the second press
    Vibration.cancel.mockClear();
    deactivateKeepAwake.mockClear();
    act(() => fireEvent.press(exampleConstantVibrationButton));
    expect(Vibration.cancel).toHaveBeenCalledTimes(1);

    // 4. Confirm the screen has been instructed to no longer stay awake
    expect(deactivateKeepAwake).toHaveBeenCalledTimes(1);
  });
});

const moveToVibrateOnCurrentDevicePage = (getAllByRole) => {
  const menuButtons = getAllByRole("button");

  const makeCurrentPhoneVibrateButton = menuButtons.find((button) =>
    within(button).queryByText(vibrateOnCurrentDevice)
  );

  return act(() => fireEvent.press(makeCurrentPhoneVibrateButton));
};
