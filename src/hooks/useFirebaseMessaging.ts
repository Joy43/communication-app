import { useEffect } from "react";
import {
  getFCMToken,
  initializeFirebaseMessaging,
  setupBackgroundNotificationHandler,
  setupForegroundNotificationHandler,
  setupNotificationReceivedListener,
} from "../services/firebaseMessaging";

/**
 * Hook to initialize Expo Notifications
 * Call this in your root layout component
 */
export function useFirebaseMessaging() {
  useEffect(() => {
    let unsubscribeForeground: any;
    let unsubscribeNotificationReceived: any;

    const initializeMessaging = async () => {
      try {
        const token = await initializeFirebaseMessaging();

        if (token) {
          console.log(
            " Notifications initialized successfully with token:",
            token,
          );

  
          unsubscribeForeground = setupForegroundNotificationHandler();

          //------  Set up background notification handler (for app in background or killed) ------
          await setupBackgroundNotificationHandler();

          // ------ Set up notification received listener (for app in foreground) ------
          unsubscribeNotificationReceived = setupNotificationReceivedListener();
        } else {
          console.warn(
            " Notifications initialized but token is null, will retry on login",
          );

          // ------- Try to get token again after a delay (app might need more time to initialize) -------
          setTimeout(async () => {
            try {
              const delayedToken = await getFCMToken();
              if (delayedToken) {
                console.log(" Token obtained on retry:", delayedToken);
              }
            } catch (error) {
              console.warn("Retry to get token failed:", error);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("❌ Failed to initialize Notifications:", error);
      }
    };

    initializeMessaging();

    //------- Cleanup function to remove listeners when component unmounts -------
    return () => {
      unsubscribeForeground?.remove?.();
      unsubscribeNotificationReceived?.remove?.();
    };
  }, []);
}
