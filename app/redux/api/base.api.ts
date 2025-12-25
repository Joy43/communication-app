import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { RootState } from "../store";

// Get the base URL with fallbacks
const getBaseUrl = () => {
  // First, try to get from app.json/env
  const configUrl = Constants.expoConfig?.extra?.BASE_URL;
  
  if (configUrl) {
    return configUrl;
  }

  // Fallback based on platform
  if (Platform.OS === "android") {
    // For Android Emulator
    return "http://10.0.2.2:3000";
  } else if (Platform.OS === "ios") {
    // For iOS Simulator, localhost works
    return "http://localhost:3000";
  } else {
    // For web or other platforms
    return "http://localhost:3000";
  }
};

const apiUrl = getBaseUrl();

console.log("🌐 API URL:", apiUrl); // Log to verify the URL

if (!apiUrl) {
  console.error("BASE_URL is not set! Check your app.json or .env file.");
}

const baseQueryAPI = fetchBaseQuery({
  baseUrl: apiUrl,
  credentials: "include",
  prepareHeaders(headers, { getState }) {
    const state = getState() as RootState;
    const accessToken = state.auth?.accessToken;
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

// Add base query with re-authorization
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryAPI(args, api, extraOptions);
  
  // Log errors for debugging
  if (result.error) {
    console.error("API Error:", result.error);
  }

  return result;
};

export const baseAPI = createApi({
  reducerPath: "baseAPI",
  baseQuery: baseQueryWithReauth,
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