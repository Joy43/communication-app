/**
 * API Error Response Interface
 */
export interface APIError {
  message: string;
  status: number;
  data?: any;
}

/**
 * Parse error from various error types
 */
export const parseAPIError = (error: any): APIError => {
  // Redux RTK Query error format
  if (error?.data?.message) {
    return {
      message: error.data.message,
      status: error.status || 500,
      data: error.data,
    };
  }

  // Fetch error format
  if (error?.message) {
    return {
      message: error.message,
      status: error.status || 500,
    };
  }

  // Network error
  if (error?.statusText) {
    return {
      message: error.statusText,
      status: error.status || 500,
    };
  }

  // Generic error
  return {
    message: "An unexpected error occurred. Please try again.",
    status: 500,
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  const parsedError = parseAPIError(error);

  // Handle specific status codes
  switch (parsedError.status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Unauthorized. Please login again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return parsedError.message || "Invalid input provided.";
    case 500:
      return "Server error. Please try again later.";
    case 502:
    case 503:
      return "Service temporarily unavailable. Please try again.";
    default:
      return parsedError.message;
  }
};

/**
 * Extract field errors from validation error response
 */
export const getFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (error?.data?.errors && Array.isArray(error.data.errors)) {
    error.data.errors.forEach((err: any) => {
      if (err.field) {
        fieldErrors[err.field] = err.message;
      }
    });
  } else if (
    error?.data?.fieldErrors &&
    typeof error.data.fieldErrors === "object"
  ) {
    Object.assign(fieldErrors, error.data.fieldErrors);
  }

  return fieldErrors;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch") ||
    error?.statusText?.toLowerCase().includes("network")
  );
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  return error?.status === 422 || error?.status === 400;
};

/**
 * Check if user is unauthorized
 */
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.status === 403;
};
