import { useCallback } from "react";
import { easyLoadingService } from "../services/easyLoadingService";

/**
 * Custom hook for easy access to EasyLoading functionality
 * Provides a convenient way to use EasyLoading throughout the app
 */
export const useEasyLoading = () => {
  const show = useCallback((message: string = "Loading...") => {
    easyLoadingService.show(message);
  }, []);

  const hide = useCallback(() => {
    easyLoadingService.hide();
  }, []);

  const showSuccess = useCallback(
    (message: string = "Success!", duration?: number) => {
      easyLoadingService.showSuccess(message, duration);
    },
    [],
  );

  const showError = useCallback(
    (message: string = "Error occurred!", duration?: number) => {
      easyLoadingService.showError(message, duration);
    },
    [],
  );

  const showInfo = useCallback(
    (message: string = "Info", duration?: number) => {
      easyLoadingService.showInfo(message, duration);
    },
    [],
  );

  return {
    show,
    hide,
    showSuccess,
    showError,
    showInfo,
  };
};
