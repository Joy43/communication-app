import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="chat-detail" options={{ headerShown: false }} />
      <Stack.Screen 
        name="call-screen" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
    </Stack>
  );
}