declare module "react-native-easy-loading" {
  import { FC } from "react";

  interface EasyLoadingConfig {
    status?: string;
    duration?: number;
    maskType?: "none" | "black" | "clear";
    animationDuration?: number;
    displayDuration?: number;
  }

  interface EasyLoadingComponent extends FC<any> {}

  interface EasyLoadingStatic {
    show(config?: EasyLoadingConfig): void;
    hide(): void;
    dismiss(): void;
    showSuccess(config?: EasyLoadingConfig): void;
    showError(config?: EasyLoadingConfig): void;
    showInfo(config?: EasyLoadingConfig): void;
    setDefaults(config?: EasyLoadingConfig): void;
    resetToDefaults(): void;
  }

  const EasyLoading: EasyLoadingComponent & EasyLoadingStatic;
  export default EasyLoading;
}
