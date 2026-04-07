import { easyLoadingService } from "./easyLoadingService";

let loadingCounter = 0;

/**
 * API Loading Interceptor
 * Automatically shows/hides loading indicators for API calls
 * Uses a counter to handle multiple simultaneous requests
 */

export const apiLoadingInterceptor = {
  /**
   * Called when an API request starts
   * Shows loading spinner on first request
   */
  onRequestStart: (message: string = "Loading...") => {
    try {
      if (loadingCounter === 0) {
        easyLoadingService.show(message, "black");
      }
      loadingCounter++;
    } catch (error) {
      console.warn("apiLoadingInterceptor.onRequestStart error:", error);
    }
  },

  /**
   * Called when an API request ends (success or error)
   * Hides loading spinner when all requests are done
   */
  onRequestEnd: () => {
    try {
      loadingCounter = Math.max(0, loadingCounter - 1);
      if (loadingCounter === 0) {
        easyLoadingService.hide();
      }
    } catch (error) {
      console.warn("apiLoadingInterceptor.onRequestEnd error:", error);
    }
  },

  /**
   * Reset the counter (useful on app startup or error recovery)
   */
  reset: () => {
    try {
      loadingCounter = 0;
      easyLoadingService.hide();
    } catch (error) {
      console.warn("apiLoadingInterceptor.reset error:", error);
    }
  },

  /**
   * Get current loading state
   */
  isLoading: () => loadingCounter > 0,
};
