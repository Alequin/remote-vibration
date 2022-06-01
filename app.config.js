import { googleMobileAdsAppId } from "./secrets.json";

const appVersionNumber = 15;

export default {
  name: "Vibration Controller",
  slug: "vibration-remote-send-vibrations-to-other-devices", // This should never be changed
  version: `${appVersionNumber}.0.0`,
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  android: {
    package: "com.just_for_fun.remote_vibration",
    versionCode: appVersionNumber,
    config: {
      googleMobileAdsAppId,
    },
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    permissions: ["VIBRATE", "ACCESS_WIFI_STATE"],
  },
};
