import { Platform } from "react-native";

/**
 * Debug utility to check notification setup
 * Call this to diagnose FCM token retrieval issues
 */
export async function debugNotificationSetup() {
  console.log("\n🔍 === NOTIFICATION SETUP DIAGNOSTICS ===");
  console.log(`📱 Platform: ${Platform.OS}`);
  console.log(`🆔 OS Version: ${Platform.Version}`);

  try {
    // Check if expo-notifications is available
    const NotificationsModule = await import("expo-notifications");
    console.log("✅ expo-notifications module loaded");

    // Check critical functions
    if (typeof NotificationsModule.getExpoPushTokenAsync === "function") {
      console.log("✅ getExpoPushTokenAsync is available");
    } else {
      console.warn("❌ getExpoPushTokenAsync NOT available");
      return {
        status: "ERROR",
        reason: "getExpoPushTokenAsync not available",
        solution: "May need native build (eas build)",
      };
    }

    // Try to get token
    console.log("⏳ Attempting to retrieve token...");
    const tokenResponse = await NotificationsModule.getExpoPushTokenAsync();

    console.log("Response object:", {
      data: tokenResponse?.data,
      type: typeof tokenResponse?.data,
      length: tokenResponse?.data?.length,
    });

    if (tokenResponse?.data) {
      console.log("✅ Token retrieved successfully:", tokenResponse.data);
      return {
        status: "SUCCESS",
        token: tokenResponse.data,
      };
    } else {
      console.warn("❌ Token is null or empty");
      return {
        status: "ERROR",
        reason: "Token returned empty",
        solutions: [
          "Check device notification permissions",
          "Ensure device has internet connection",
          "Try native build with eas build",
          "Restart the app",
        ],
      };
    }
  } catch (error: any) {
    console.error("❌ Error during diagnostics:", error?.message || error);
    return {
      status: "ERROR",
      reason: error?.message || "Unknown error",
      solutions: [
        "Check if using Expo Go (won't work)",
        "Use native build: eas build",
        "Check device permissions",
        "Verify internet connection",
      ],
    };
  }
}

/**
 * Check if running in Expo Go
 */
export function isExpoGo(): boolean {
  // In Expo Go, constants.expoVersion is available
  try {
    const Constants = require("expo-constants").default;
    const isInExpoGo = Constants?.expoVersion && !Constants?.nativeVersion;
    console.log(
      isInExpoGo
        ? "⚠️ Running in Expo Go (notifications limited)"
        : "✅ Running native build",
    );
    return isInExpoGo;
  } catch (error) {
    return false;
  }
}

/**
 * Get device information useful for debugging
 */
export function getDeviceInfo() {
  try {
    const Constants = require("expo-constants").default;
    return {
      isDevice: Constants?.isDevice,
      platform: Platform.OS,
      osVersion: Platform.Version,
      expoVersion: Constants?.expoVersion,
      nativeVersion: Constants?.nativeVersion,
      sessionId: Constants?.sessionId,
    };
  } catch (error) {
    return { error: "Could not get device info" };
  }
}
