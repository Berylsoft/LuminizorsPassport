export interface Platform {
  showToast(options: {
    title: string;
    icon?: "success" | "error" | "loading";
    duration?: number;
  }): Promise<void>;
  setTitle(title: string): Promise<void>;
  setClipboard(text: string): Promise<void>;
  getSystemTheme(): "light" | "dark";
  onSystemThemeChange(callback: (theme: "light" | "dark") => void): void;
  openSetting(config?: {
    withSubscriptions?: boolean;
  }): Promise<OpenSettingResult>;
  getNoticificationSubscribeStatus(template: string): Promise<SubscribeStatus>;
  subscribeNotification(
    templates: string[],
  ): Promise<SubscribeNotificationResult>;
  login(): Promise<string>;
}

export interface OpenSettingResult {
  authSetting: Taro.openSetting.SuccessCallbackResult["authSetting"];
  subscriptionsSetting?: Taro.openSetting.SuccessCallbackResult["subscriptionsSetting"];
}

export type SubscribeStatus = "enabled" | "disabled" | "unconfigured";

export interface SubscribeNotificationResult {
  [TEMPLATE_ID: string]: boolean;
}
