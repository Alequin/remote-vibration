jest.mock("react-native/Libraries/Animated/src/NativeAnimatedHelper");

import React from "React";
import { render, within } from "@testing-library/react-native";
import { AppRouter } from "./App";
import * as pageNames from "./src/pages/page-names";

describe("App - Menu", () => {
  it("displays the expected menu buttons by default", async () => {
    const { getAllByRole } = render(<AppRouter />);

    const buttons = getAllByRole("button");

    const makeCurrentPhoneVibrateButton = buttons.find((button) =>
      within(button).queryByText(pageNames.vibrateOnCurrentPhone)
    );
    expect(makeCurrentPhoneVibrateButton).toBeDefined();
    expect(
      within(makeCurrentPhoneVibrateButton).getByTestId("vibrateIcon")
    ).toBeDefined();

    const receiveVibrationsButton = buttons.find((button) =>
      within(button).queryByText(pageNames.receiveVibrations)
    );
    expect(receiveVibrationsButton).toBeDefined();
    expect(
      within(receiveVibrationsButton).getByTestId("connectedPeopleIcon")
    ).toBeDefined();

    const sendVibrationsButton = buttons.find((button) =>
      within(button).queryByText(pageNames.sendVibrations)
    );
    expect(sendVibrationsButton).toBeDefined();
    expect(within(sendVibrationsButton).getByTestId("wifiIcon")).toBeDefined();

    const disableAdsButton = buttons.find((button) =>
      within(button).queryByText("Turn Off Ads")
    );
    expect(disableAdsButton).toBeDefined();
    expect(within(disableAdsButton).getByTestId("stopIcon")).toBeDefined();
  });
});
