import EasyLoading from "react-native-easy-loading";

/**
 * EasyLoading Service
 * Provides a centralized interface for showing/hiding loading indicators
 * with consistent messages throughout the app
 */

export const easyLoadingService = {
  /**
   * Show loading spinner with a message
   */
  show: (
    message: string = "Loading...",
    maskType?: "none" | "black" | "clear",
  ) => {
    try {
      if (EasyLoading && typeof EasyLoading.show === "function") {
        EasyLoading.show({
          status: message,
          maskType: maskType || "black",
        });
      }
    } catch (error) {
      console.warn("EasyLoading.show error:", error);
    }
  },

  /**
   * Hide the loading spinner
   */
  hide: () => {
    try {
      if (EasyLoading && typeof EasyLoading.dismiss === "function") {
        EasyLoading.dismiss();
      }
    } catch (error) {
      console.warn("EasyLoading.dismiss error:", error);
    }
  },

  /**
   * Show success message with optional duration
   */
  showSuccess: (message: string = "Success!", duration: number = 1500) => {
    try {
      if (EasyLoading && typeof EasyLoading.showSuccess === "function") {
        EasyLoading.showSuccess({
          status: message,
          duration,
        });
      }
    } catch (error) {
      console.warn("EasyLoading.showSuccess error:", error);
    }
  },

  /**
   * Show error message with optional duration
   */
  showError: (message: string = "Error occurred!", duration: number = 1500) => {
    try {
      if (EasyLoading && typeof EasyLoading.showError === "function") {
        EasyLoading.showError({
          status: message,
          duration,
        });
      }
    } catch (error) {
      console.warn("EasyLoading.showError error:", error);
    }
  },

  /**
   * Show info message with optional duration
   */
  showInfo: (message: string = "Info", duration: number = 1500) => {
    try {
      if (EasyLoading && typeof EasyLoading.showInfo === "function") {
        EasyLoading.showInfo({
          status: message,
          duration,
        });
      }
    } catch (error) {
      console.warn("EasyLoading.showInfo error:", error);
    }
  },

  /**
   * Configure EasyLoading defaults
   */
  configure: () => {
    try {
      if (EasyLoading && typeof EasyLoading.setDefaults === "function") {
        EasyLoading.setDefaults({
          displayDuration: 2000,
          animationDuration: 200,
        });
      }
    } catch (error) {
      console.warn("EasyLoading.configure error:", error);
    }
  },

  /**
   * Reset to defaults
   */
  reset: () => {
    try {
      if (EasyLoading && typeof EasyLoading.resetToDefaults === "function") {
        EasyLoading.resetToDefaults();
      }
    } catch (error) {
      console.warn("EasyLoading.reset error:", error);
    }
  },
};
