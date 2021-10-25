const fs = require("fs");
const { googleMobileAdsAppId } = require("./secrets.json");

const appVersionNumber = 10;

fs.writeFileSync(
  __dirname + "/app.json",
  JSON.stringify(
    {
      expo: {
        name: "Vibration Control! Help yourself and others relax",
        slug: "vibration-remote-send-vibrations-to-other-devices", // This should never be changed
        version: `${appVersionNumber}.0.0`,
        orientation: "portrait",
        icon: "./assets/icon.png",
        updates: {
          fallbackToCacheTimeout: 0,
        },
        assetBundlePatterns: ["**/*"],
        ios: {
          supportsTablet: true,
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
      },
    },
    null,
    2
  )
);
