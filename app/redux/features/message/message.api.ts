import { TPrivateChatUser } from "@/app/types/chat.type";
import { baseAPI } from "../../api/base.api";


export const messageAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    // ------------------get private chat users  with list of user message & last message
    getPrivateChatUsers: build.query<TPrivateChatUser[], null>({
      query: () => ({
        url: `/private-chat/users/all`,
        method: "GET",
      }),
      providesTags: ["message"],
    }),

    // ------------------get private chat with list of user message & last message
    getPrivateChat: build.query({
      query: () => ({
        url: `/private-chat/users/all`,
        method: "GET",
      }),
      providesTags: ["message"],
    }),

    // ----------------get private chat with specific chat it  conversationId --
    getPrivateChatById: build.query({
      query: (conversationId: string) => ({
        url: `/private-chat/${conversationId}`,
        method: "GET",
      }),
      providesTags: ["message"],
    }),

    // ---------- mark all messages as read in a conversation  with conversationId  post mehod
    markMessagesAsRead: build.mutation({
      query: (conversationId: string) => ({
        url: `/private-chat/mark-messages-read/${conversationId}/mark-read`,
        method: "POST",
      }),
      invalidatesTags: ["message"],
    }),
  }),
});

export const {
  useGetPrivateChatUsersQuery,
  useGetPrivateChatQuery,
  useGetPrivateChatByIdQuery,
  useMarkMessagesAsReadMutation,
} = messageAPI;
