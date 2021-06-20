import { AdMobBanner } from "expo-ads-admob";
import fetch from "node-fetch";
import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { AppContext } from "../../app-context";
import { authToken, bannerUnitId } from "../../secrets.json";
import { darkSpaceCadet } from "../utilities/colours";
import { isSmallScreen } from "../utilities/is-small-screen";
import { useIsKeyboardVisible } from "./use-is-keyboard-visible";

export const AdBanner = ({ environment, shouldShowAds }) => {
  const { deviceId } = useContext(AppContext);
  const isKeyboardVisible = useIsKeyboardVisible();
  // On small screens when the keyboard is visible some elements do not fit on the page
  if (!shouldShowAds || (isSmallScreen() && isKeyboardVisible)) return null;
  return (
    <View style={{ ...ViewStyles.adContainer }}>
      <AdMobBanner
        adUnitID={
          environment === "production"
            ? bannerUnitId
            : "ca-app-pub-3940256099942544/6300978111" // Test admob unit id
        }
        onAdViewDidReceiveAd={async () => {
          await fetch("http://remote-vibration-server.herokuapp.com/log", {
            method: "POST",
            headers: {
              deviceId,
              authToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ adLoadFail: false }),
          });
        }}
        onDidFailToReceiveAdWithError={async (result) => {
          await fetch("http://remote-vibration-server.herokuapp.com/log", {
            method: "POST",
            headers: {
              deviceId,
              authToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ result, adLoadFail: true }),
          });
        }}
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
