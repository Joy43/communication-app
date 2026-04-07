import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function ProfileLayout() {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      background: "#FFFFFF",
    },
    dark: {
      background: "#000000",
    },
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
        animation: "fade",
      }}
    >
      <Stack.Screen name="my-profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
      <Stack.Screen name="user-profile" options={{ headerShown: false }} />
    </Stack>
  );
}
