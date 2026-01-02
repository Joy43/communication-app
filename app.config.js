export default {
  expo: {
    name: "communication-app",
    slug: "communication-app",
    scheme: "communicationapp",
    extra: {
      BASE_URL:
        process.env.EXPO_PUBLIC_BASE_API ||
        "https://unwritable-israel-ecclesiological.ngrok-free.dev",
      eas: {
        projectId: "cfeb8f68-3ab5-438a-9d77-9c9ee7042393",
      },
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ssjoy43.communicationapp",
      infoPlist: {
        NSCameraUsageDescription: "Camera access for video calls",
        NSMicrophoneUsageDescription: "Microphone access for voice calls",
      },
    },

    android: {
      package: "com.ssjoy43.communicationapp",
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#E6F4FE",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
