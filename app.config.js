export default {
  expo: {
    name: "communication-app",
    slug: "communication-app",
    owner: "ssjoy43", 
    scheme: "communicationapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",

    extra: {
      BASE_URL:
        process.env.EXPO_PUBLIC_BASE_API ||
        "https://communication-app-server.onrender.com",
      router: {},
      eas: {
        projectId: "f8aa592d-358d-4183-ad5f-62a0ddc5d279", 
      },
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ssjoy43.communicationapp",
      googleServicesFile: "./GoogleService-Info.plist", 
      infoPlist: {
        NSCameraUsageDescription: "Camera access for video calls",
        NSMicrophoneUsageDescription: "Microphone access for voice calls",
        UIUserInterfaceStyle: "Automatic",
      },
      entitlements: {
        "aps-environment": "production", 
      },
    },

    android: {
      package: "com.ssjoy43.communicationapp",
      googleServicesFile: "./google-services.json", 
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "android.permission.POST_NOTIFICATIONS", 
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/communica-screen.png",
        backgroundColor: "#E6F4FE",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png",
    },

    plugins: [
      "expo-router",
      "expo-audio",

      // ✅ Firebase plugins
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",

      // ✅ Required for Firebase iOS static frameworks
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],

      "expo-notifications", 

      [
        "expo-splash-screen",
        {
          image: "./assets/images/communica-screen.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],

      // ⚠️ Temporarily disabled: react-native-webrtc incompatible with RN 0.81.5
      // Will re-enable with compatible version after successful build
      // [
      //   "@config-plugins/react-native-webrtc",
      //   {
      //     cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
      //     microphonePermission:
      //       "Allow $(PRODUCT_NAME) to access your microphone",
      //   },
      // ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};