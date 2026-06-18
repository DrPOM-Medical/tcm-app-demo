import type { ExpoConfig } from "expo/config";
import image from "expo-image/plugin";
import imagePicker from "expo-image-picker/plugin";

const config: ExpoConfig = {
  name: "tcm-app",
  slug: "tcm-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "tcmapp",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
    appleTeamId: "N4D2BT476X",
    bundleIdentifier: "net.drpom.tcmdemo",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      },
    ],
    image(),
    imagePicker({
      photosPermission:
        "This app accesses your photos to set your custom profile picture.",
    }),
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default (): ExpoConfig => config;
