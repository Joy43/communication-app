import { Platform } from "react-native";

let messaging: any = null;

try {
  messaging = require("@react-native-firebase/messaging").default;
} catch (error) {
  if (__DEV__) {
    console.log("ℹ️ Firebase messaging not available in development (Expo Go)");
  } else {
    console.warn(
      "⚠️ Firebase messaging not available (development environment)",
    );
  }
}

async function requestPermissions(): Promise<boolean> {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not initialized");
    return false;
  }
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("✅ iOS notification permissions granted:", authStatus);
    } else {
      console.warn("⚠️ iOS notification permissions denied");
    }
    return enabled;
  }

  // Android 13+ needs runtime permission
  if (Platform.OS === "android") {
    const { PermissionsAndroid } = require("react-native");
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      console.log(
        granted
          ? "✅ Android notification permissions granted"
          : "⚠️ Android notification permissions denied",
      );
      return granted;
    }
  }

  return true;
}

export async function initializeFirebaseMessaging(): Promise<string | null> {
  if (!messaging) {
    if (__DEV__) {
      console.log("ℹ️ Firebase messaging not available in development");
    }
    return null;
  }

  try {
    const granted = await requestPermissions();
    if (!granted) {
      console.warn("⚠️ Permissions not granted, skipping FCM initialization");
      return null;
    }

    const token = await getFCMToken();
    return token;
  } catch (error) {
    console.error("❌ Error initializing Firebase Messaging:", error);
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    if (__DEV__) {
      console.log(
        "ℹ️ Firebase messaging not available - using mock token for development",
      );
    }
    // Return empty string in development (fallback gracefully)
    return "";
  }

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Getting FCM token (attempt ${attempt}/${maxRetries})...`);

      // Check if device has Google Play Services (Android)
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();

      if (token && token.length > 0) {
        console.log("✅ FCM Token retrieved:", token.substring(0, 20) + "...");
        return token;
      }

      console.warn(`⚠️ Empty token on attempt ${attempt}`);
    } catch (error: any) {
      console.error(
        `❌ FCM token error (attempt ${attempt}/${maxRetries}):`,
        error?.message || error,
      );
    }

    if (attempt < maxRetries) {
      const delay = 500 * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error("❌ Failed to get FCM token after all attempts");
  return null;
}

export function setupForegroundNotificationHandler(): () => void {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return () => {};
  }

  const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
    console.log("📬 Foreground message received:", remoteMessage);
  });

  return unsubscribe;
}

export function setupBackgroundNotificationHandler(): void {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return;
  }

  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log("📬 Background message received:", remoteMessage);
  });
}

/**
 * Get the notification that opened the app from quit state
 */
export async function setupBackgroundNotificationHandlerAsync(): Promise<void> {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return;
  }

  try {
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log(
        "📬 App opened from quit state via notification:",
        initialNotification,
      );
    }
  } catch (error) {
    console.error("❌ Error getting initial notification:", error);
  }
}

export function setupNotificationReceivedListener(): () => void {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return () => {};
  }

  const unsubscribe = messaging().onNotificationOpenedApp(
    (remoteMessage: any) => {
      console.log("📬 Notification opened app from background:", remoteMessage);
    },
  );

  return unsubscribe;
}

export function onTokenRefresh(callback: (token: string) => void): () => void {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return () => {};
  }

  return messaging().onTokenRefresh((token: any) => {
    console.log("🔄 FCM token refreshed:", token.substring(0, 20) + "...");

    callback(token);
  });
}

export async function subscribeToNotifications(topic: string): Promise<void> {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return;
  }

  try {
    await messaging().subscribeToTopic(topic);
    console.log(`✅ Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
  }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromNotifications(
  topic: string,
): Promise<void> {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available");
    return;
  }

  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`✅ Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Failed to unsubscribe from topic ${topic}:`, error);
  }
}
