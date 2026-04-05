import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { FCMTokenHook } from "../types/fcm";

// Conditionally import Device only on native platforms
let Device: any = null;
if (Platform.OS !== "web") {
  Device = require("expo-device");
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useFCMToken = (): FCMTokenHook => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "undetermined" | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (Device && !Device.isDevice && Platform.OS === "ios") {
      setError("Must use physical device for iOS push notifications");
      return false;
    }

    try {
      if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        setPermissionStatus(enabled ? "granted" : "denied");
        if (!enabled) {
          setError("Push notification permission denied");
          return false;
        }
      }

      if (Platform.OS === "android") {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status as "granted" | "denied");
        if (status !== "granted") {
          setError("Push notification permission denied");
          return false;
        }
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Permission error";
      setError(message);
      return false;
    }
  };

  const generateFCMToken = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return null;

      const token = await messaging().getToken();

      if (token) {
        setFcmToken(token);
        console.log("FCM Token:", token);
        return token;
      }

      setError("Failed to generate FCM token");
      return null;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Token generation failed";
      console.error("FCM token error:", message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateFCMToken();

    const unsubscribe = messaging().onTokenRefresh((newToken: string) => {
      console.log("FCM Token refreshed:", newToken);
      setFcmToken(newToken);
      // TODO: sync refreshed token to your backend
    });

    return unsubscribe;
  }, [generateFCMToken]);

  return {
    fcmToken,
    permissionStatus,
    loading,
    error,
    regenerate: generateFCMToken,
  };
};
