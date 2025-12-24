import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const activeUsers = [
  { id: 1, name: "Sariya", avatar: "https://i.pravatar.cc/150?img=1" },
  { id: 2, name: "Faisal", avatar: "https://i.pravatar.cc/150?img=2" },
  { id: 3, name: "Sariya", avatar: "https://i.pravatar.cc/150?img=3" },
  { id: 4, name: "Nancy", avatar: "https://i.pravatar.cc/150?img=4" },
  { id: 5, name: "Jhon", avatar: "https://i.pravatar.cc/150?img=5" },
  { id: 6, name: "Rocky", avatar: "https://i.pravatar.cc/150?img=6" },
];

const chats = [
  {
    id: 1,
    name: "Jhon Xaria",
    message: "I'm on the way. Wait for me.",
    time: "Just now",
    avatar: "https://i.pravatar.cc/150?img=5",
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: "Nancy Sufea",
    message: "I'm on the way. Wait for me.",
    time: "2m ago",
    avatar: "https://i.pravatar.cc/150?img=4",
    unread: 1,
    online: false,
  },
  {
    id: 3,
    name: "Rocky",
    message: "I'm on the way. Wait for me.",
    time: "2days ago",
    avatar: "https://i.pravatar.cc/150?img=6",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Foysal",
    message: "I'm on the way. Wait for me.",
    time: "12 Jul, 25",
    avatar: "https://i.pravatar.cc/150?img=7",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Nancy Sufea",
    message: "I'm on the way. Wait for me.",
    time: "21 Jun, 25",
    avatar: "https://i.pravatar.cc/150?img=4",
    unread: 0,
    online: false,
  },
];

export default function ChatListScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 py-10 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold">Chat</Text>
          <TouchableOpacity>
            <Search size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Active Users */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4 border-b border-gray-100"
        >
          {activeUsers.map((user) => (
            <TouchableOpacity key={user.id} className="items-center mr-4">
              <View className="relative">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-16 h-16 rounded-full"
                />
                <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </View>
              <Text className="text-xs mt-1">{user.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat List */}
        <View className="flex-1">
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              onPress={() => router.push("/chat-detail")}
              className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
            >
              <View className="relative">
                <Image
                  source={{ uri: chat.avatar }}
                  className="w-14 h-14 rounded-full"
                />
                {chat.online && (
                  <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-gray-900">
                  {chat.name}
                </Text>
                <Text className="text-sm text-blue-500 mt-0.5">
                  {chat.message}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-500 mb-1">{chat.time}</Text>
                {chat.unread > 0 && (
                  <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-semibold">
                      {chat.unread}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
