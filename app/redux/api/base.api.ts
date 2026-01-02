import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";

import { RootState } from "../store";

// Get the base URL with fallbacks
const apiUrl =
  Constants.expoConfig?.extra?.BASE_URL ||
  "https://a103c7d01944.ngrok-free.app";
console.log("API Base URL:", apiUrl);
if (!apiUrl) {
  console.error("VITE_API_URL is not set! Check your .env file.");
}

const baseQueryAPI = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: "include",
  prepareHeaders(headers, { getState }) {
    const accessToken = (getState() as RootState).auth.accessToken;
    console.log("Access Token in prepareHeaders:", accessToken);
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
      console.log("Authorization header set:", `Bearer ${accessToken}`);
    } else {
      console.warn("No access token found in auth state");
    }
    return headers;
  },
});

export const baseAPI = createApi({
  reducerPath: "baseAPI",
  baseQuery: baseQueryAPI,
  tagTypes: [
    "user",
    "message",
    "call",
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
