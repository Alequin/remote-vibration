import React from "React";
import { fireEvent, render, within, act } from "@testing-library/react-native";
import App from "./App";
jest.mock("./src/shared/vibrate", () => ({
  vibrate: {
    start: jest.fn(),
    stop: jest.fn(),
  },
}));
import { vibrate } from "./src/shared/vibrate";

describe("App - Vibrate on current phone", () => {
  it("allows the users to go to the 'vibrate on current phone' page from the 'main menu'", () => {
    const { getAllByRole, getByTestId } = render(<App />);

    // Starts on main menu
    expect(getByTestId("main-menu-page")).toBeDefined();

    moveToVibrateOnCurrentPhonePage(getAllByRole);

    // Moves to expected page
    expect(getByTestId("vibrate-on-current-phone-page")).toBeDefined();
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

    expect(vibrate.start).toHaveBeenCalledTimes(1);
  });
});

const moveToVibrateOnCurrentPhonePage = (getAllByRole) => {
  const menuButtons = getAllByRole("button");

  const makeCurrentPhoneVibrateButton = menuButtons.find((button) =>
    within(button).queryByText("Vibrate On Current Phone")
  );

  act(() => fireEvent.press(makeCurrentPhoneVibrateButton));
};
