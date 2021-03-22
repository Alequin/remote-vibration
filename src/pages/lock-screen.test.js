const mockRemoveHardwareBackButtonEventListener = jest.fn();
jest.mock("react-native/Libraries/Utilities/BackHandler", () => ({
  addEventListener: jest
    .fn()
    .mockReturnValue({ remove: mockRemoveHardwareBackButtonEventListener }),
}));

import { act, fireEvent, render } from "@testing-library/react-native";
import { noop } from "lodash";
import React, { useState } from "React";
import { BackHandler, TouchableOpacity, View } from "react-native";
import { preventDefaultEvent } from "../utilities/prevent-default-event";
import { LockScreen, returnTrue } from "./lock-screen";

describe("Lock Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Shows the expected components on screen", async () => {
    const mockNavigation = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    const { getByTestId, getByText } = render(
      <LockScreen onUnlock={noop} navigation={mockNavigation} />
    );

    expect(getByTestId("lockedIcon")).toBeDefined();
    expect(
      getByText("Drag the slider from left to right to unlock")
    ).toBeDefined();
  });

  it("disables the navigation buttons whilst on this page", async () => {
    const mockNavigation = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    render(<LockScreen onUnlock={noop} navigation={mockNavigation} />);

    expect(mockNavigation.addListener).toHaveBeenCalledTimes(1);
    expect(mockNavigation.addListener).toHaveBeenCalledWith(
      "beforeRemove",
      preventDefaultEvent
    );
  });

  it("enables the navigation buttons when the page is unmounted", async () => {
    const mockNavigation = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    const { getByTestId } = render(
      <TestUnmount>
        <LockScreen onUnlock={noop} navigation={mockNavigation} />
      </TestUnmount>
    );

    const unmountButton = getByTestId("unmountButton");

    act(() => fireEvent.press(unmountButton));

    expect(mockNavigation.removeListener).toHaveBeenCalledTimes(1);
    expect(mockNavigation.removeListener).toHaveBeenCalledWith("beforeRemove");
  });

  it("disables the hardware back button whilst on the page", async () => {
    const mockNavigation = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    render(<LockScreen onUnlock={noop} navigation={mockNavigation} />);

    expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
    expect(BackHandler.addEventListener).toHaveBeenCalledWith(
      "hardwareBackPress",
      returnTrue
    );
  });

  it("enables the hardware back button when the page is unmounted", async () => {
    const mockNavigation = {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };

    const { getByTestId } = render(
      <TestUnmount>
        <LockScreen onUnlock={noop} navigation={mockNavigation} />
      </TestUnmount>
    );

    const unmountButton = getByTestId("unmountButton");

    act(() => fireEvent.press(unmountButton));

    expect(mockRemoveHardwareBackButtonEventListener).toHaveBeenCalledTimes(1);
  });
});

const TestUnmount = ({ children }) => {
  const [isMounted, setIsMounted] = useState(true);

  return (
    <View>
      {isMounted ? children : null}
      <TouchableOpacity
        testID="unmountButton"
        onPress={() => setIsMounted(false)}
      ></TouchableOpacity>
    </View>
  );
};
