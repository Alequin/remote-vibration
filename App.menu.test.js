import React from "React";
import { render, within } from "@testing-library/react-native";
import App from "./App";

describe("App - Menu", () => {
  it("displays the expected menu buttons by default", async () => {
    const { getAllByRole } = render(<App />);

    const buttons = getAllByRole("button");

    const makeCurrentPhoneVibrateButton = buttons.find((button) =>
      within(button).queryByText("Vibrate On Current Phone")
    );
    expect(makeCurrentPhoneVibrateButton).toBeDefined();
    expect(
      within(makeCurrentPhoneVibrateButton).getByTestId("vibrateIcon")
    ).toBeDefined();

    const connectToAnotherDeviceButton = buttons.find((button) =>
      within(button).queryByText("Connect To Another Device")
    );
    expect(connectToAnotherDeviceButton).toBeDefined();
    expect(
      within(connectToAnotherDeviceButton).getByTestId("linkIcon")
    ).toBeDefined();

    const disableAdsButton = buttons.find((button) =>
      within(button).queryByText("Turn Off Ads")
    );
    expect(disableAdsButton).toBeDefined();
    expect(within(disableAdsButton).getByTestId("stopIcon")).toBeDefined();
  });
});
