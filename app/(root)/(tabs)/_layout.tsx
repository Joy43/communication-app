import { Tabs } from "expo-router";
import { MessageCircle, User, Users } from "lucide-react-native";
import React from "react";
import { Platform, useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Theme colors
  const colors = {
    light: {
      primary: "#0084FF",
      background: "#FFFFFF",
      tabBar: "#F8F9FA",
      inactive: "#8E8E93",
      border: "#E5E5EA",
    },
    dark: {
      primary: "#0A84FF",
      background: "#000000",
      tabBar: "#1C1C1E",
      inactive: "#8E8E93",
      border: "#38383A",
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
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
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
              strokeWidth={focused ? 2 : 2}
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
            <User
              color={color}
              size={24}
              fill={focused ? color : "none"}
              strokeWidth={focused ? 2 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
