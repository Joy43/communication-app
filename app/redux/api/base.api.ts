import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "../store";

// Get the base URL with fallbacks
const apiUrl = process.env.EXPO_PUBLIC_BASE_API || "http://localhost:3000";
if (!apiUrl) {
  console.error("VITE_API_URL is not set! Check your .env file.");
}

const baseQueryAPI = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: "include",
  prepareHeaders(headers, { getState }) {
    const accessToken = (getState() as RootState).auth.accessToken;
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const baseAPI = createApi({
  reducerPath: "baseAPI",
  baseQuery: baseQueryAPI,
  tagTypes: [
    "user",
    "content",
    "privacy-policy",
    "terms",
    "faq",
    "contributor",
    "users",
    "ad-management",
    "plan",
    "profile",
    "language",
    "bookmark",
    "live",
    "podcast",
    "report",
    "community",
  ],
  endpoints: () => ({}),
});
