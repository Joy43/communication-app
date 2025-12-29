// app/(tabs)/chat-detail.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Mic,
  MoreVertical,
  Phone,
  Plus,
  Send,
  Video,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { selectUser } from "../redux/auth/auth.slice";
import { useAppSelector } from "../redux/hook";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export default function ChatDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const { userId, userName, conversationId } = params;
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;

  const [message, setMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Socket hook
  const {
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    sendMessage,
    loadConversation,
    markAsRead,
    startTyping,
    stopTyping,
  } = useSocket();

  // WebRTC hook
  const { initiateCall, isCallActive } = useWebRTC();

  const conversationMessages = messages[conversationId as string] || [];
  const isRecipientOnline = onlineUsers[userId as string] || false;
  const isRecipientTyping = (
    typingUsers[conversationId as string] || []
  ).includes(userId as string);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId as string);
    }
  }, [conversationId]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBackPress();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // Handle keyboard events for better scrolling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (conversationId && conversationMessages.length > 0) {
      markAsRead(conversationId as string);
    }
  }, [conversationId, conversationMessages.length]);

  useEffect(() => {
    if (conversationMessages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationMessages.length]);

  const handleSendMessage = () => {
    if (!message.trim() || !userId) return;

    sendMessage(userId as string, message.trim());
    setMessage("");

    if (conversationId) {
      stopTyping(conversationId as string, userId as string);
    }

    // Keep keyboard open after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleTyping = (text: string) => {
    setMessage(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.trim() && conversationId) {
      startTyping(conversationId as string, userId as string);

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId as string, userId as string);
      }, 3000) as number;
    } else if (conversationId) {
      stopTyping(conversationId as string, userId as string);
    }
  };

  const handleBackPress = () => {
    // Dismiss keyboard first if visible
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/chat");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      router.replace("/chat");
    }
  };

  const handleVoiceCall = async () => {
    if (!conversationId) {
      Alert.alert("Error", "No conversation found");
      return;
    }

    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Socket is not connected. Please try again."
      );
      return;
    }

    if (isCallActive) {
      Alert.alert("Call in Progress", "You already have an active call");
      return;
    }

    try {
      console.log("Initiating voice call...");
      await initiateCall(conversationId as string, "AUDIO");

      // Navigate to call screen with receiver info
      router.push({
        pathname: "/call-screen",
        params: {
          userName: userName,
          userId: userId,
          conversationId: conversationId,
        },
      });
    } catch (error) {
      console.error("Voice call error:", error);
      Alert.alert("Call Failed", "Could not initiate call. Please try again.");
    }
  };

  const handleVideoCall = async () => {
    if (!conversationId) {
      Alert.alert("Error", "No conversation found");
      return;
    }

    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Socket is not connected. Please try again."
      );
      return;
    }

    if (isCallActive) {
      Alert.alert("Call in Progress", "You already have an active call");
      return;
    }

    try {
      console.log("Initiating video call...");
      await initiateCall(conversationId as string, "VIDEO");

      // Navigate to call screen with receiver info
      router.push({
        pathname: "/call-screen",
        params: {
          userName: userName,
          userId: userId,
          conversationId: conversationId,
        },
      });
    } catch (error) {
      console.error("Video call error:", error);
      Alert.alert("Call Failed", "Could not initiate call. Please try again.");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView
        className="flex-1 bg-gray-50"
        style={{
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          enabled
        >
          {/* Header */}
          <View className="bg-white px-4 py-3 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity
                  onPress={handleBackPress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mx-3">
                  <Text className="text-white text-lg font-semibold">
                    {(userName as string)?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-base font-semibold">{userName}</Text>
                  <View className="flex-row items-center">
                    {isRecipientOnline && (
                      <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    )}
                    <Text className="text-xs text-gray-500">
                      {isRecipientTyping
                        ? "Typing..."
                        : isRecipientOnline
                          ? "Online"
                          : "Offline"}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="mr-4"
                  onPress={handleVoiceCall}
                  disabled={isCallActive || !isConnected}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Phone
                    size={22}
                    color={isCallActive || !isConnected ? "#ccc" : "#000"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  className="mr-4"
                  onPress={handleVideoCall}
                  disabled={isCallActive || !isConnected}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, right: 10 }}
                >
                  <Video
                    size={22}
                    color={isCallActive || !isConnected ? "#ccc" : "#000"}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MoreVertical size={22} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 20,
              flexGrow: 1,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {!isConnected && (
              <View className="items-center py-4">
                <Text className="text-gray-400 text-sm">Connecting...</Text>
              </View>
            )}

            {conversationMessages.length === 0 && isConnected && (
              <View className="items-center py-10">
                <Text className="text-gray-400 text-base">No messages yet</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Start the conversation!
                </Text>
              </View>
            )}

            {conversationMessages.map((msg: Message, index: number) => {
              const isMe = msg.senderId === currentUserId;
              const showDate =
                index === 0 ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(
                    conversationMessages[index - 1].createdAt
                  ).toDateString();

              return (
                <View key={msg.id}>
                  {showDate && (
                    <View className="items-center my-4">
                      <Text className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(msg.createdAt).toDateString() ===
                        new Date().toDateString()
                          ? "Today"
                          : new Date(msg.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  <View
                    className={`mb-3 ${isMe ? "items-end" : "items-start"}`}
                  >
                    <View
                      className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        isMe
                          ? "bg-blue-500 rounded-tr-sm"
                          : "bg-white rounded-tl-sm"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isMe ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {msg.content}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-xs text-gray-400">
                        {formatTime(msg.createdAt)}
                      </Text>
                      {isMe && (
                        <Text className="text-xs text-blue-500 ml-1">✓✓</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {isRecipientTyping && (
              <View className="items-start mb-3">
                <View className="bg-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Text className="text-gray-500 text-base">• • •</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View className="bg-white px-4 py-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-3"
                onPress={() => {
                  Keyboard.dismiss();
                  // Handle attachment logic
                }}
              >
                <Plus size={24} color="#666" />
              </TouchableOpacity>
              <View className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
                <TextInput
                  ref={inputRef}
                  value={message}
                  onChangeText={handleTyping}
                  placeholder="Write your message"
                  placeholderTextColor="#999"
                  className="text-sm"
                  multiline
                  maxLength={1000}
                  returnKeyType="default"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={true}
                  style={{ maxHeight: 100 }}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                />
              </View>
              {!message.trim() ? (
                <TouchableOpacity
                  className="ml-3"
                  onPress={() => {
                    // Handle voice recording
                    Alert.alert(
                      "Voice Message",
                      "Voice recording feature coming soon!"
                    );
                  }}
                >
                  <Mic size={24} color="#666" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="ml-3 w-10 h-10 rounded-full items-center justify-center bg-blue-500"
                  onPress={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  activeOpacity={0.8}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Remove this - it's now in _layout.tsx */}
      {/* <IncomingCallModal /> */}
    </>
  );
}

