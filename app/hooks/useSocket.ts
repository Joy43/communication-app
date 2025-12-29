import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { selectaccessToken, selectUser } from "../redux/auth/auth.slice";
import { useAppSelector } from "../redux/hook";

interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  file?: any;
}

interface Conversation {
  type: string;
  chatId: string;
  participant: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  lastMessage: Message | null;
  updatedAt: string;
  isRead?: boolean;
}

interface UserStatus {
  userId: string;
  isOnline: boolean;
  status: string;
}

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>(
    {}
  );

  const token = useAppSelector(selectaccessToken);
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    // base url from .env
    const socket = io(`${process.env.EXPO_PUBLIC_BASE_API}/message`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      // Load conversations on connect
      socket.emit("load_conversations");

      // Request current online users
      socket.emit("get_online_users");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("success", (data) => {
      console.log("Connection success:", data);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Conversation events
    socket.on("conversation_list", (data: Conversation[]) => {
      console.log("Conversations loaded:", data);
      setConversations(data);

      // Extract and set online users from conversations
      const onlineUsersMap: { [key: string]: boolean } = {};
      data.forEach((conv) => {
        if (conv.participant && conv.participant.id !== currentUserId) {
          // You might need to get online status from somewhere
          // For now we'll rely on user_status_changed events
        }
      });
    });

    socket.on("new_conversation", (data) => {
      console.log("New conversation:", data);
      setMessages((prev) => ({
        ...prev,
        [data.conversationId]: data.messages || [],
      }));
    });

    // Single conversation loaded
    socket.on("conversation_messages", (data) => {
      console.log("Conversation messages loaded:", data);
      if (data.conversationId && data.messages) {
        setMessages((prev) => ({
          ...prev,
          [data.conversationId]: data.messages,
        }));
      }
    });

    // Message events
    socket.on("new_message", (message: Message) => {
      console.log("New message received:", message);

      // Update messages for this conversation
      setMessages((prev) => ({
        ...prev,
        [message.conversationId]: [
          ...(prev[message.conversationId] || []),
          message,
        ],
      }));

      // Update conversations list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.chatId === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              isRead: false,
            };
          }
          return conv;
        });

        // Sort by most recent
        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    });

    socket.on("message_read", (data) => {
      console.log("Messages marked as read:", data);

      // Update message statuses
      setMessages((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || []).map((msg) => ({
          ...msg,
          isRead: true,
        })),
      }));
    });

    socket.on("message_deleted", (data) => {
      console.log("Message deleted:", data);

      setMessages((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || []).filter(
          (msg) => msg.id !== data.messageId
        ),
      }));
    });

    // Typing events
    socket.on("typing_start", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.conversationId]: [
          ...(prev[data.conversationId] || []),
          data.userId,
        ].filter((v, i, a) => a.indexOf(v) === i),
      }));
    });

    socket.on("typing_stop", (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] || []).filter(
          (id) => id !== data.userId
        ),
      }));
    });

    // User status events
    socket.on("online_users_list", (data: { [key: string]: boolean }) => {
      console.log("Online users list received:", data);
      // Filter out current user
      const filteredOnlineUsers = { ...data };
      if (currentUserId && filteredOnlineUsers[currentUserId]) {
        delete filteredOnlineUsers[currentUserId];
      }
      setOnlineUsers(filteredOnlineUsers);
    });

    socket.on("user_status_changed", (data: UserStatus) => {
      console.log("User status changed:", data);
      // Don't add current user to online users list
      if (data.userId !== currentUserId) {
        setOnlineUsers((prev) => ({
          ...prev,
          [data.userId]: data.isOnline,
        }));
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [token, currentUserId]);

  // Send message
  const sendMessage = (
    recipientId: string,
    content: string,
    messageType = "TEXT"
  ) => {
    if (!socketRef.current) return;

    socketRef.current.emit("send_message", {
      recipientId,
      content,
      messageType,
    });
  };

  // Load single conversation
  const loadConversation = (conversationId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("load_single_conversation", conversationId);
  };

  // Mark messages as read
  const markAsRead = (conversationId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("mark_as_read", conversationId);
  };

  // Delete message
  const deleteMessage = (messageId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("delete_message", messageId);
  };

  // Typing indicators
  const startTyping = (conversationId: string, recipientId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("typing_start", { conversationId, recipientId });
  };

  const stopTyping = (conversationId: string, recipientId: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit("typing_stop", { conversationId, recipientId });
  };

  return {
    socket: socketRef.current,
    isConnected,
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    sendMessage,
    loadConversation,
    markAsRead,
    deleteMessage,
    startTyping,
    stopTyping,
  };
};
