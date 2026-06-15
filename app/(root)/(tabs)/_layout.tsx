import { Tabs } from "expo-router";
import { Home, Compass, Plus, Store, User } from "lucide-react-native";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = {
    primary: "#2D55FF",
    inactive: "#9CA3AF",
    tabBar: "#FFFFFF",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home size={26} color={color} fill={focused ? color : "none"} strokeWidth={2} />
          ),
        }}
      />

      {/* Posts – hidden */}
      <Tabs.Screen name="posts" options={{ href: null }} />

      {/* Explore (mapped to chat) */}
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color }) => (
            <Compass size={26} color={color} strokeWidth={2} />
          ),
        }}
      />

      {/* Create Button */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="w-[50px] h-[50px] rounded-full bg-[#FF3B60] justify-center items-center shadow-sm">
              <Plus size={28} color="#FFFFFF" strokeWidth={3} />
            </View>
          ),
        }}
      />

      {/* Store (mapped to contacts) */}
      <Tabs.Screen
        name="contacts"
        options={{
          tabBarIcon: ({ color }) => (
            <Store size={26} color={color} strokeWidth={2} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <User size={26} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}