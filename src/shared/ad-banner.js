import { AdMobBanner } from "expo-ads-admob";
import React from "react";
import { StyleSheet, View } from "react-native";
import { bannerUnitId } from "../../secrets.json";
import { darkSpaceCadet } from "../utilities/colours";
import { isSmallScreen } from "../utilities/is-small-screen";
import { useIsKeyboardVisible } from "./use-is-keyboard-visible";

export const AdBanner = ({ environment, shouldShowAds }) => {
  const isKeyboardVisible = useIsKeyboardVisible();
  // On small screens when the keyboard is visible some elements do not fit on the page
  if (!shouldShowAds || (isSmallScreen() && isKeyboardVisible)) return null;
  return (
    <View style={{ ...ViewStyles.adContainer }}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={
          environment === "production"
            ? bannerUnitId
            : "ca-app-pub-3940256099942544/6300978111" // Test admob unit id
        }
        servePersonalizedAds={false}
      />
    </View>
  );
};

const ViewStyles = StyleSheet.create({
  adContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: darkSpaceCadet,
  },
});
