import { Stack } from "expo-router";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { IncomingCallModal } from "./components/IncomingCallModal";
import { WebRTCProvider } from "./contexts/WebRTCContext";
import "./global.css";
import { persistor, store } from "./redux/store";

export default function RootLayout() {
  const appColor = "#10B981";

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}
      >
        <WebRTCProvider>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: appColor,
              paddingTop: Platform.OS === "android" ? 0 : 0,
            }}
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

            {/* Global Incoming Call Modal - renders on top of all screens */}
            <IncomingCallModal />
          </SafeAreaView>
        </WebRTCProvider>
      </PersistGate>
    </Provider>
  );
}
