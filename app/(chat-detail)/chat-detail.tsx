import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Mic,
  MoreVertical,
  Phone,
  Plus,
  Send,
  Video,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const messages = [
  {
    id: 1,
    text: "Hello, nice to meet you.",
    time: "10:01 am",
    sender: "other",
  },
  {
    id: 2,
    text: "Hey Jhon! Loved your from last night",
    time: "10:03 am",
    sender: "me",
  },
  {
    id: 3,
    text: "Aww. Thank you! Enjoyed it",
    time: "10:03 am",
    sender: "other",
  },
  {
    id: 4,
    text: "Do you stream every weekend?",
    time: "10:05 am",
    sender: "me",
  },
  {
    id: 5,
    text: "Yes! Saturday night are my usual",
    time: "10:06 am",
    sender: "other",
  },
  {
    id: 6,
    text: "Nice! Just tell me about your weekend plan",
    time: "10:08 am",
    sender: "me",
  },
  {
    id: 7,
    text: "Sure!",
    time: "10:08 am",
    sender: "other",
    typing: true,
  },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView className="flex-1 py-10 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=5" }}
                className="w-10 h-10 rounded-full mx-3"
              />
              <View>
                <Text className="text-base font-semibold">Jhon Xaria</Text>
                <Text className="text-xs text-gray-500">Online</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-4">
                <Phone size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity className="mr-4">
                <Video size={22} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity>
                <MoreVertical size={22} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView className="flex-1 px-4 py-4">
          {/* Welcome Button */}
          <View className="items-center mb-4">
            <TouchableOpacity className="bg-blue-500 px-6 py-2 rounded-full">
              <Text className="text-white font-medium">Nice to meet you!</Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-400 mt-1">10:00 am</Text>
          </View>

          {messages.map((msg) => (
            <View
              key={msg.id}
              className={`mb-3 ${
                msg.sender === "me" ? "items-end" : "items-start"
              }`}
            >
              <View
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-blue-500 rounded-tr-sm"
                    : "bg-white rounded-tl-sm"
                }`}
              >
                <Text
                  className={`text-sm ${
                    msg.sender === "me" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {msg.text}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-gray-400">{msg.time}</Text>
                {msg.sender === "me" && (
                  <Text className="text-xs text-blue-500 ml-1">✓✓</Text>
                )}
              </View>
              {msg.typing && (
                <View className="bg-gray-200 px-4 py-2 rounded-full mt-2">
                  <Text className="text-gray-500">• • •</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View className="bg-white px-4 py-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-3">
              <Plus size={24} color="#666" />
            </TouchableOpacity>
            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="write your message"
                placeholderTextColor="#999"
                className="text-sm"
              />
            </View>
            <TouchableOpacity className="ml-3">
              <Mic size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-3 bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
              <Send size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
