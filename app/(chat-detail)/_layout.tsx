import { Stack } from "expo-router";
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="chat-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
