import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { IncomingCallModal } from "../src/components/IncomingCallModal";
import { WebRTCProvider } from "../src/contexts/WebRTCContext";
import { useFirebaseMessaging } from "../src/hooks/useFirebaseMessaging";
import { persistor, store } from "../src/redux/store";
import { setupBackgroundNotificationHandler } from "../src/services/firebaseMessaging";
import "./global.css";

setupBackgroundNotificationHandler();
export default function RootLayout() {
  const appColor = "#10B981";

  useFirebaseMessaging();

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}
      >
        <WebRTCProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: appColor }}
            className="bg-white"
          >
            <StatusBar style="light" backgroundColor={appColor} animated />

            <View style={{ flex: 1, backgroundColor: appColor }}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(start)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(root)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(chat-detail)"
                  options={{ headerShown: false }}
                />
              </Stack>
              <Toast />
            </View>

            <IncomingCallModal />
          </SafeAreaView>
        </WebRTCProvider>
      </PersistGate>
    </Provider>
  );
}
