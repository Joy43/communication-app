import { Stack } from "expo-router";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "./global.css";
import { persistor, store } from "./redux/store";
import { IncomingCallModal } from "./components/IncomingCallModal";
// import Providers from '@/providers/Providers';

export default function RootLayout() {
  const appColor = "#10B981";

  return (
    // <Providers>
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
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: appColor,
            paddingTop: Platform.OS === "android" ? 0 : 0,
          }}
          className="bg-white"
        >
          {/* StatusBar from Expo handles both platforms perfectly */}
          <StatusBar style="light" backgroundColor={appColor} animated />

          {/* Wrapper view ensures Android fills background below SafeArea */}
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
              <Stack.Screen
                name="(productdetials)"
                options={{ headerShown: false }}
              />
              {/* <Stack.Screen name="(product)" options={{ headerShown: false }} />
              <Stack.Screen name="(order)" options={{ headerShown: false }} />
              <Stack.Screen name="(login)" options={{ headerShown: false }} />
              <Stack.Screen name="(cart)" options={{ headerShown: false }} /> */}

              <Stack.Screen
                name="(settings)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
               <IncomingCallModal />
            </Stack>

            <Toast />
          </View>
        </SafeAreaView>
      </PersistGate>
    </Provider>
    // </Providers>
  );
}
