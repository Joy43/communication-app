// app/types/chat.type.ts

// Call-related types matching backend schema
export type CallStatus =
  | "CALLING"
  | "RINING" // Note: Backend has typo, should be "RINGING"
  | "ACTIVE"
  | "END"
  | "MISSED"
  | "DECLINED";

export type CallType = "AUDIO" | "VIDEO";

export interface CallParticipant {
  id: string;
  callId: string;
  socketId: string;
  userName: string;
  hasVideo: boolean;
  hasAudio: boolean;
  joinedAt: string;
  leftAt?: string;
}

export interface Call {
  id: string;
  hostUserId: string;
  recipientUserId?: string;
  status: CallStatus;
  title?: string;
  isPrivate: boolean;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  participants?: CallParticipant[];
}

export interface TPrivateChatUser {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  isOnline: boolean;
  lastActiveAt: string | null;
  status: "online" | "recently_active" | "active_today" | "offline";
}

export interface MessageSender {
  id: string;
  name: string;
  profilePicture: string | null;
}

export interface MessageFile {
  id: string;
  url: string;
  type: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE" | "CALL_EVENT";
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  sender: MessageSender;
  file?: MessageFile;
  isRead?: boolean;
  statuses?: Array<{
    userId: string;
    status: "SENT" | "DELIVERED" | "READ";
  }>;
}

export interface Participant {
  id: string;
  name: string;
  profilePicture: string | null;
}

export interface Conversation {
  type: "private";
  chatId: string;
  participant: Participant;
  lastMessage: Message | null;
  updatedAt: string;
  isRead?: boolean;
}

export interface ConversationDetail {
  conversationId: string;
  participants: Participant[];
  messages: Message[];
}

export interface UserStatus {
  userId: string;
  isOnline: boolean;
  status: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
}

export interface SendMessagePayload {
  recipientId: string;
  content: string;
  messageType?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  fileId?: string;
}

// Socket event types
export enum PrivateChatEvents {
  // Connection events
  SUCCESS = "success",
  ERROR = "error",

  // Conversation events
  LOAD_CONVERSATIONS = "load_conversations",
  CONVERSATION_LIST = "conversation_list",
  LOAD_SINGLE_CONVERSATION = "load_single_conversation",
  NEW_CONVERSATION = "new_conversation",

  // Message events
  SEND_MESSAGE = "send_message",
  NEW_MESSAGE = "new_message",
  MESSAGE_SENT = "message_sent",
  MESSAGE_DELIVERED = "message_delivered",
  MESSAGE_READ = "message_read",
  MARK_AS_READ = "mark_as_read",
  USER_STATUS_CHANGED = "user_status_changed",

  // Typing events
  TYPING_START = "typing_start",
  TYPING_STOP = "typing_stop",

  // Delete events
  DELETE_MESSAGE = "delete_message",
  MESSAGE_DELETED = "message_deleted",
}
