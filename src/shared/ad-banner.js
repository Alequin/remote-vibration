import { AdMobBanner } from "expo-ads-admob";
import { noop } from "lodash";
import React from "react";
import { isSmallScreen } from "../utilities/is-small-screen";
import { useIsKeyboardVisible } from "./use-is-keyboard-visible";

export const AdBanner = () => {
  const isKeyboardVisible = useIsKeyboardVisible();
  // On small screens when the keyboard is visible some elements do not fit on the page
  if (isSmallScreen() && isKeyboardVisible) return null;
  return (
    <AdMobBanner
      bannerSize="fullBanner"
      adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
      servePersonalizedAds // true or false
      onDidFailToReceiveAdWithError={noop}
    />
  );
};
