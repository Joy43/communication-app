import { Tabs } from "expo-router";
import { HomeIcon, MessageCircle, User2, Users } from "lucide-react-native";
import { Platform, useColorScheme, useWindowDimensions, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BP = { tablet: 600, large: 840 } as const;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets        = useSafeAreaInsets();
  const { width }     = useWindowDimensions();

  const isTablet      = width >= BP.tablet;
  const isLarge       = width >= BP.large;
  const isDark        = colorScheme === "dark";

  // ─── design tokens ───────────────────────────────────────────────────────────
  const theme = {
    primary:       isDark ? "#0A84FF" : "#0084FF",
    tabBar:        isDark ? "#1C1C1E" : "#FFFFFF",
    inactive:      "#8E8E93",
    activeBg:      isDark ? "#1A2838" : "#E8F4FD",
    shadowOpacity: isDark ? 0.6 : 0.12,
  };

  // ─── design constants ───────────────────────────────────────────────────────
  const BAR_HEIGHT = isTablet ? 72 : 64;
  const ICON_SIZE  = isLarge  ? 26 : isTablet ? 24 : 22;
  const LABEL_SIZE = isLarge  ? 12 : isTablet ? 11 : 10;

  // Floating pill horizontal inset
  const hInset = isLarge
    ? (width - 640) / 2
    : isTablet ? 32 : 16;

  // iOS needs extra room for the home indicator
  const bottomInset = Platform.OS === "ios"
    ? insets.bottom + (isTablet ? 14 : 8)
    : isTablet ? 14 : 10;


  const makeIcon = (
    Icon: React.ElementType,
    label: string,
    withFill = false,
  ) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <View
        className="flex-1 flex-col items-center justify-center"
        style={{ minHeight: BAR_HEIGHT, gap: 2 }}
      >
        <Icon
          color={color}
          size={ICON_SIZE}
          strokeWidth={focused ? 2.5 : 2}
          {...(withFill ? { fill: focused ? color : "none" } : {})}
        />
        <Text
          className="font-semibold tracking-wide"
          style={{
            fontSize:  LABEL_SIZE,
            color,
            lineHeight: LABEL_SIZE + 3,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    );

  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarShowLabel: false, // our makeIcon renders the label

        tabBarActiveTintColor:   theme.primary,
        tabBarInactiveTintColor: theme.inactive,

        // ── floating pill bar ─────────────────────────────────────────────────
        tabBarStyle: {
          position:         "absolute",
          bottom:           bottomInset,
          left:             hInset,
          right:            hInset,
          height:           BAR_HEIGHT,
          borderTopWidth:   0,
          backgroundColor:  theme.tabBar,
          borderRadius:     24,
          paddingHorizontal: isTablet ? 8 : 4,
          shadowColor:      "#000",
          shadowOffset:     { width: 0, height: 6 },
          shadowOpacity:    theme.shadowOpacity,
          shadowRadius:     18,
          elevation:        12,
          overflow:         "hidden",
        },

        // ── per-item ──────────────────────────────────────────────────────────
        // No height, no paddingVertical — that's the key fix.
        tabBarItemStyle: {
          borderRadius:     18,
          marginHorizontal: isTablet ? 4 : 2,
          paddingTop:       0,
          paddingBottom:    0,
        },

        tabBarActiveBackgroundColor: theme.activeBg,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          title:       "Home",
          tabBarIcon:  makeIcon(HomeIcon, "Home", true),
        }}
      />

      {/* Posts – hidden */}
      <Tabs.Screen name="posts" options={{ href: null }} />

      {/* Chat */}
      <Tabs.Screen
        name="chat"
        options={{
          title:      "Chats",
          tabBarIcon: makeIcon(MessageCircle, "Chats", true),
        }}
      />

      {/* Contacts */}
      <Tabs.Screen
        name="contacts"
        options={{
          title:      "Contacts",
          tabBarIcon: makeIcon(Users, "Contacts"),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title:      "Profile",
          tabBarIcon: makeIcon(User2, "Profile"),
        }}
      />
    </Tabs>
  );
}