jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// import "react-test-renderer";
import React from "React";
import { render, within } from "@testing-library/react-native";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";

describe("App - Menu", () => {
  it("does not show the navigation header on the main menu", async () => {
    const { queryByText } = render(<AppRouter />);
    expect(queryByText(pageNames.mainMenu)).toBeNull();
  });

  it("displays the expected menu buttons by default", async () => {
    const { getAllByRole, getAllByTestId } = render(<AppRouter />);

    const buttons = getAllByRole("button");

    const makeCurrentPhoneVibrateButton = buttons.find((button) =>
      within(button).queryByText(pageNames.vibrateOnCurrentDevice)
    );
    expect(makeCurrentPhoneVibrateButton).toBeDefined();
    expect(getAllByTestId("vibrateIcon")).toBeDefined();

    const receiveVibrationsButton = buttons.find((button) =>
      within(button).queryByText(pageNames.receiveVibrations)
    );
    expect(receiveVibrationsButton).toBeDefined();
    expect(
      within(receiveVibrationsButton).getByTestId("connectWithoutContactIcon")
    ).toBeDefined();

    const sendVibrationsButton = buttons.find((button) =>
      within(button).queryByText(pageNames.sendVibrations)
    );
    expect(sendVibrationsButton).toBeDefined();
    expect(within(sendVibrationsButton).getByTestId("wifiIcon")).toBeDefined();
  });
});
