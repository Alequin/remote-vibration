import { AdMobBanner } from "expo-ads-admob";
import { noop } from "lodash";
import React from "react";
import { StyleSheet, View } from "react-native";
import { isSmallScreen } from "../utilities/is-small-screen";
import { useIsKeyboardVisible } from "./use-is-keyboard-visible";

// Test admob unit id
const testBannerId = "ca-app-pub-3940256099942544/6300978111";

export const AdBanner = () => {
  const isKeyboardVisible = useIsKeyboardVisible();
  // On small screens when the keyboard is visible some elements do not fit on the page
  if (isSmallScreen() && isKeyboardVisible) return null;
  return (
    <View style={ViewStyles.adContainer}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={testBannerId}
        servePersonalizedAds={false}
        onDidFailToReceiveAdWithError={noop}
      />
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  adContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
