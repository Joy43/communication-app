/**
 * API Integration Testing & Debugging Guide
 *
 * This file provides utilities for testing API integration and handling errors
 */

import Toast from "react-native-toast-message";
import {
  getErrorMessage,
  isAuthError,
  isNetworkError,
} from "./apiErrorHandler";

/**
 * Log API request details
 */
export const logAPIRequest = (
  method: string,
  endpoint: string,
  data?: any,
  headers?: any,
) => {
  console.log(`
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                         API REQUEST                                       ║
    ╠══════════════════════════════════════════════════════════════════════════╣
    ║ Method:      ${method.toUpperCase().padEnd(60)}║
    ║ Endpoint:    ${endpoint.padEnd(60)}║
    ${data ? `║ Body:        ${JSON.stringify(data).substring(0, 60).padEnd(60)}║\n` : ""}${
      headers
        ? `║ Headers:     ${JSON.stringify(headers).substring(0, 60).padEnd(60)}║`
        : ""
    }    ╚══════════════════════════════════════════════════════════════════════════╝
  `);
};

/**
 * Log API response details
 */
export const logAPIResponse = (
  method: string,
  endpoint: string,
  status: number,
  data?: any,
) => {
  const statusColor = status >= 200 && status < 300 ? "✅" : "❌";
  console.log(`
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                         API RESPONSE                                      ║
    ╠══════════════════════════════════════════════════════════════════════════╣
    ║ ${statusColor} Status:     ${status.toString().padEnd(60)}║
    ║ Method:      ${method.toUpperCase().padEnd(60)}║
    ║ Endpoint:    ${endpoint.padEnd(60)}║
    ${
      data
        ? `║ Response:    ${JSON.stringify(data).substring(0, 60).padEnd(60)}║`
        : ""
    }    ╚══════════════════════════════════════════════════════════════════════════╝
  `);
};

/**
 * Show API error toast with proper handling
 */
export const showAPIErrorToast = (error: any, context?: string) => {
  const errorMessage = getErrorMessage(error);

  // Check for specific error types
  if (isAuthError(error)) {
    Toast.show({
      type: "error",
      text1: "Authentication Error",
      text2: "Please login again",
    });
    // Trigger logout if needed
    return "AUTH_ERROR";
  }

  if (isNetworkError(error)) {
    Toast.show({
      type: "error",
      text1: "Network Error",
      text2: "Check your internet connection",
    });
    return "NETWORK_ERROR";
  }

  // Generic error
  Toast.show({
    type: "error",
    text1: context || "Error",
    text2: errorMessage,
  });

  return "GENERIC_ERROR";
};

/**
 * API Integration Checklist
 *
 * Use this to verify proper setup:
 *
 * ✅ Items to verify:
 * 1. BASE_URL is set in Constants.expoConfig?.extra?.BASE_URL
 * 2. Access token is stored in Redux auth.accessToken
 * 3. Authorization header is set: Bearer {token}
 * 4. FormData is used for file uploads
 * 5. Error responses are properly formatted: { message: string, ... }
 * 6. API endpoints return proper status codes (200, 201, 400, 401, etc.)
 * 7. File uploads use multipart/form-data
 * 8. Images are validated before upload
 * 9. Loading states are managed during requests
 * 10. User is notified of errors
 */

export const API_INTEGRATION_CHECKLIST = {
  baseURL: "BASE_URL configured in expo config",
  authentication: "Bearer token in Authorization header",
  formData: "FormData used for multipart uploads",
  errorHandling: "API errors parsed and displayed",
  loadingStates: "Loading indicators shown during requests",
  imageValidation: "Images validated before upload",
  permissions: "Media library permissions requested",
};

/**
 * Common API Error Solutions
 */
export const API_ERROR_SOLUTIONS = {
  "401": "Token expired or invalid - User needs to login again",
  "403": "User doesn't have permission for this action",
  "404": "Resource not found - Check endpoint URL",
  "422": "Validation error - Check required fields",
  "500": "Server error - Contact support or try again later",
  IMAGE_UPLOAD_FAILED: "Ensure image is < 5MB and proper format",
  PERMISSION_DENIED: "Enable gallery access in device settings",
  NO_NETWORK: "Check internet connection and try again",
};
