import { Tabs } from "expo-router";
import { MessageCircle, User2, Users } from "lucide-react-native";
import React from "react";
import { Platform, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const colors = {
    light: {
      primary: "#0084FF",
      background: "#FFFFFF",
      tabBar: "#FFFFFF",
      inactive: "#8E8E93",
      border: "#E5E5EA",
      activeBackground: "#E8F4FD",
    },
    dark: {
      primary: "#0A84FF",
      background: "#000000",
      tabBar: "#1C1C1E",
      inactive: "#8E8E93",
      border: "#38383A",
      activeBackground: "#1A2838",
    },
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? insets.bottom + 10 : 12,
          left: 16,
          right: 16,
          height: 65,
          borderTopWidth: 0,
          backgroundColor: theme.tabBar,
          borderRadius: 24,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: colorScheme === "dark" ? 0.6 : 0.12,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          borderRadius: 16,
          marginHorizontal: 2,
          height: 65,
        },
        tabBarActiveBackgroundColor: theme.activeBackground,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
              color={color}
              size={24}
              fill={focused ? color : "none"}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, focused }) => (
            <Users color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User2 color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
