jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");

import React from "React";
import { render, within } from "@testing-library/react-native";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";

describe("App - Menu", () => {
  it("displays the expected menu buttons by default", async () => {
    const { getAllByRole, getAllByTestId, debug } = render(<AppRouter />);

    const buttons = getAllByRole("button");

    const makeCurrentPhoneVibrateButton = buttons.find((button) =>
      within(button).queryByText(pageNames.vibrateOnCurrentPhone)
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
