import { useSocket } from "@/app/hooks/useSocket";
import { selectaccessToken, selectUser } from "@/app/redux/auth/auth.slice";
import { useGetPrivateChatUsersQuery } from "@/app/redux/features/message/message.api";
import { useAppSelector } from "@/app/redux/hook";
import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatListScreen() {
  const router = useRouter();
  const token = useAppSelector(selectaccessToken);
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;

  // Fetch all users
  const {
    data: chatUsers,
    isLoading: usersLoading,
  
  } = useGetPrivateChatUsersQuery(null);

  // Socket for real-time updates
  const { isConnected, conversations, onlineUsers } = useSocket();

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  console.log("Socket connected:", isConnected);
  console.log("Conversations:", conversations);
  console.log("Online users:", onlineUsers);

  return (
    <SafeAreaView className="flex-1 py-10 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-xl font-semibold">Chat</Text>
            {isConnected && (
              <View className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </View>
          <TouchableOpacity>
            <Search size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Active Users (showing online users first) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4 border-b border-gray-100"
        >
          {usersLoading ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : chatUsers && chatUsers.length > 0 ? (
            chatUsers
              .filter((user) => user.id !== currentUserId)
              .map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="items-center mr-4"
                  onPress={() => {
                    // Find conversation with this user
                    const conv = conversations.find(
                      (c) => c.participant.id === user.id
                    );

                    router.push({
                      pathname: "/chat-detail",
                      params: {
                        userId: user.id,
                        userName: user.name,
                        conversationId: conv?.chatId || "",
                      },
                    });
                  }}
                >
                  <View className="relative">
                    {user.profilePicture ? (
                      <Image
                        source={{ uri: user.profilePicture }}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center">
                        <Text className="text-white text-lg font-semibold">
                          {user.name}
                        </Text>
                      </View>
                    )}
                    {onlineUsers[user.id] && (
                      <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </View>
                  <Text className="text-xs mt-1" numberOfLines={1}>
                    {user.name}
                  </Text>
                </TouchableOpacity>
              ))
          ) : (
            <Text className="text-gray-500 text-sm">No active users</Text>
          )}
        </ScrollView>

        {/* Chat List - Show conversations from socket */}
        <View className="flex-1">
          {!isConnected ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">Connecting...</Text>
            </View>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.chatId}
                onPress={() => {
                  router.push({
                    pathname: "/chat-detail",
                    params: {
                      userId: conv.participant.id,
                      userName: conv.participant.name,
                      conversationId: conv.chatId,
                    },
                  });
                }}
                className="flex-row items-center px-4 py-3 border-b border-gray-50 active:bg-gray-50"
              >
                <View className="relative">
                  {conv.participant.profilePicture ? (
                    <Image
                      source={{ uri: conv.participant.profilePicture }}
                      className="w-14 h-14 rounded-full"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
                      <Text className="text-white text-xl font-semibold">
                        {conv.participant.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {onlineUsers[conv.participant.id] && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  {!conv.isRead && conv.lastMessage && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">•</Text>
                    </View>
                  )}
                </View>

                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-gray-900 flex-1">
                      {conv.participant.name}
                    </Text>
                    <Text className="text-xs text-gray-400 ml-2">
                      {conv.lastMessage &&
                        formatTimeAgo(conv.lastMessage.createdAt)}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm mt-0.5 ${
                      conv.isRead
                        ? "text-gray-500"
                        : "text-gray-900 font-medium"
                    }`}
                    numberOfLines={1}
                  >
                    {conv.lastMessage?.content || "No messages yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Text className="text-gray-500 text-base">
                No conversations yet
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Start a conversation with someone!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
