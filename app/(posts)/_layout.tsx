import { Stack } from "expo-router";

export default function PostsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="all-posts" />
      <Stack.Screen name="following" />
      <Stack.Screen name="trending" />
      <Stack.Screen name="saved-posts" />
    </Stack>
  );
}
