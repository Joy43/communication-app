import Constants from "expo-constants";
import { Platform } from "react-native";

// Lazy load Notifications to avoid native module errors in development
let Notifications: any = null;
let notificationsLoaded = false;

// Get project ID from app.json for push token retrieval
function getProjectId(): string | null {
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;
    if (projectId) {
      console.log("✅ Project ID found:", projectId.substring(0, 8) + "...");
    } else {
      console.warn("⚠️ No project ID found in app.json extra.eas");
    }
    return projectId || null;
  } catch (error) {
    console.warn("⚠️ Could not read project ID:", error);
    return null;
  }
}

async function loadNotifications() {
  if (notificationsLoaded) {
    return Notifications;
  }

  try {
    const module = await import("expo-notifications");
    if (module && typeof module.setNotificationHandler === "function") {
      Notifications = module;
      notificationsLoaded = true;
      return Notifications;
    } else {
      console.warn(
        "⚠️ expo-notifications module incomplete or not properly initialized",
      );
      notificationsLoaded = true;
      return null;
    }
  } catch (error) {
    console.warn("⚠️ expo-notifications not available:", error);
    notificationsLoaded = true;
    return null;
  }
}

/**
 * Initialize Expo Notifications
 * This should be called once in your app initialization
 */
export async function initializeFirebaseMessaging() {
  try {
    const NotificationsModule = await loadNotifications();
    if (!NotificationsModule) {
      console.warn(
        "⚠️ Notifications module not available, skipping initialization",
      );
      return null;
    }

    // Set notification handler
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request user permission for notifications (iOS)
    if (Platform.OS === "ios") {
      const permission = await NotificationsModule.requestPermissionsAsync();
      if (permission.granted) {
        console.log("✅ Notification permissions granted (iOS)");
      } else {
        console.warn("⚠️ Notification permissions not granted (iOS)");
      }
    }

    // Get the FCM token (Expo Push Token)
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      console.log("✅ Expo Push Token:", fcmToken);
      return fcmToken;
    } else {
      console.warn("⚠️ Could not get Expo Push Token");
      return null;
    }
  } catch (error) {
    console.error("❌ Error initializing notifications:", error);
    return null;
  }
}

/**
 * Get Expo Push Token (similar to FCM token)
 * Retries up to 3 times with exponential backoff
 * Falls back to device ID if token cannot be retrieved
 */
export async function getFCMToken(): Promise<string | null> {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < maxRetries) {
    try {
      const NotificationsModule = await loadNotifications();
      if (!NotificationsModule) {
        console.warn(
          `⚠️ Notifications module not available (attempt ${retryCount + 1}/${maxRetries})`,
        );
        retryCount++;
        // Exponential backoff: 500ms, 1s, 2s
        const delay = 500 * Math.pow(2, retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Check if the function exists before calling
      if (typeof NotificationsModule.getExpoPushTokenAsync !== "function") {
        console.warn(
          "⚠️ getExpoPushTokenAsync is not available - may need EAS build or device setup",
        );
        lastError = "getExpoPushTokenAsync not available";
        break; // Don't retry if function doesn't exist
      }

      console.log(
        `📤 Attempting to get Expo Push Token (attempt ${retryCount + 1}/${maxRetries})...`,
      );

      const tokenResponse = await NotificationsModule.getExpoPushTokenAsync();
      const token = tokenResponse?.data;

      if (token && token.length > 0) {
        console.log("✅ Expo Push Token retrieved successfully:", token);
        return token;
      } else {
        console.warn(
          `⚠️ Token is empty (attempt ${retryCount + 1}/${maxRetries})`,
        );
        lastError = "Token returned empty";
        retryCount++;
        // Exponential backoff: 500ms, 1s, 2s
        const delay = 500 * Math.pow(2, retryCount - 1);
        if (retryCount < maxRetries) {
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } catch (error: any) {
      lastError = error;
      console.error(
        `❌ Error getting Expo Push Token (attempt ${retryCount + 1}/${maxRetries}):`,
        error?.message || error,
      );
      retryCount++;
      // Exponential backoff: 500ms, 1s, 2s
      const delay = 500 * Math.pow(2, retryCount - 1);
      if (retryCount < maxRetries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("❌ Failed to get FCM token after 3 attempts");
  console.error("Last error:", lastError);
  console.warn(
    "💡 This may happen if:\n" +
      "  • App is running in Expo Go (tokens only work on native builds)\n" +
      "  • Device permissions are not granted\n" +
      "  • Expo project is not properly configured\n" +
      "  • Network connection issue\n\n" +
      "For production: Use 'eas build' to create a native build",
  );

  // Return null - let the backend handle it gracefully
  return null;
}

/**
 * Set up foreground notification handler
 */
export function setupForegroundNotificationHandler() {
  loadNotifications().then((NotificationsModule) => {
    if (!NotificationsModule) return () => {};
    const unsubscribe =
      NotificationsModule.addNotificationResponseReceivedListener(
        (response: any) => {
          console.log("📬 Notification response received:", response);
          // Handle notification tap here
        },
      );
    return unsubscribe;
  });
}

/**
 * Set up background notification handler
 */
export async function setupBackgroundNotificationHandler() {
  try {
    const NotificationsModule = await loadNotifications();
    if (!NotificationsModule) return;

    const notification =
      await NotificationsModule.getLastNotificationResponseAsync();
    if (notification) {
      console.log("📬 Initial notification:", notification);
    }
  } catch (error) {
    console.error("❌ Error setting up background handler:", error);
  }
}

/**
 * Listen for notification received (while app is open)
 */
export function setupNotificationReceivedListener() {
  loadNotifications().then((NotificationsModule) => {
    if (!NotificationsModule) return () => {};
    const unsubscribe = NotificationsModule.addNotificationReceivedListener(
      (notification: any) => {
        console.log(
          "📬 Notification received while app is open:",
          notification,
        );
      },
    );
    return unsubscribe;
  });
}

/**
 * Dummy functions for compatibility (Expo doesn't use topics)
 */
export async function subscribeToNotifications(topic: string) {
  console.log(
    `ℹ️  Topic subscription: "${topic}" (not applicable for Expo Push Notifications)`,
  );
  console.log("Use your backend to manage user subscriptions instead");
}

export async function unsubscribeFromNotifications(topic: string) {
  console.log(
    `ℹ️  Topic unsubscription: "${topic}" (not applicable for Expo Push Notifications)`,
  );
}

/**
 * Send a test notification (requires backend integration)
 * This is just a reference - implement on your backend
 */
export async function sendTestNotification(title: string, body: string) {
  try {
    const NotificationsModule = await loadNotifications();
    if (!NotificationsModule) {
      console.warn("⚠️ Notifications not available");
      return;
    }

    await NotificationsModule.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: 1,
      },
      trigger: {
        type: NotificationsModule.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
    console.log("✅ Test notification scheduled");
  } catch (error) {
    console.error("❌ Error scheduling test notification:", error);
  }
}

/**
 * Get last notification response (useful for deep linking)
 */
export async function getLastNotificationResponse() {
  try {
    const NotificationsModule = await loadNotifications();
    if (!NotificationsModule) return null;

    const response =
      await NotificationsModule.getLastNotificationResponseAsync();
    return response?.notification.request.content.data || null;
  } catch (error) {
    console.error("❌ Error getting last notification response:", error);
    return null;
  }
}
