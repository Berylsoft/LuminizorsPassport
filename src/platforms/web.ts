/* eslint-disable @typescript-eslint/require-await */

import { reactive } from "vue";
import type {
  OpenSettingResult,
  SubscribeNotificationResult,
  SubscribeStatus,
} from "./types";

/** @private */
export const _toastState = reactive<{
  show: boolean;
  msg: string;
  type: string;
  duration: number;
}>({
  show: false,
  msg: "",
  type: "text",
  duration: 2000,
});
export const showToast = ({
  title,
  icon,
  duration,
}: {
  title: string;
  icon?: "success" | "error" | "loading";
  duration?: number;
}) => {
  _toastState.msg = title.replaceAll(/\n/g, "<br/>");
  _toastState.type = icon === "error" ? "fail" : (icon ?? "text");
  _toastState.duration = duration ?? 2000;
  _toastState.show = true;
  return new Promise<void>((resolve) => {
    setTimeout(resolve, _toastState.duration);
  });
};

export const setTitle = async (title: string) => {
  document.title = title;
};

export const setClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const onSystemThemeChange = (
  callback: (theme: "light" | "dark") => void,
) => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      callback(e.matches ? "dark" : "light");
    });
};

/** @todo simulated setting UI */
export const openSetting = async (config?: {
  withSubscriptions?: boolean;
}): Promise<OpenSettingResult> => {
  console.debug("openSetting");

  const result: OpenSettingResult = {
    authSetting: {},
  };
  if (config?.withSubscriptions) {
    const notificationSetting = JSON.parse(
      localStorage.getItem("notification") ?? "{}",
    ) as Record<string, SubscribeStatus>;
    result.subscriptionsSetting = {
      mainSwitch: true,
      itemSettings: notificationSetting,
    };
  }
  return result;
};

export const getNoticificationSubscribeStatus = async (
  template: string,
): Promise<SubscribeStatus> => {
  const notificationSetting = JSON.parse(
    localStorage.getItem("notification") ?? "{}",
  ) as Record<string, SubscribeStatus | undefined>;
  return notificationSetting[template] || "unconfigured";
};

/** @todo simulated subscription UI*/
export const subscribeNotification = async (
  templates: string[],
): Promise<SubscribeNotificationResult> => {
  console.debug(`subscribeNotification: ${templates.join(", ")}`);

  const notificationSetting = JSON.parse(
    localStorage.getItem("notification") ?? "{}",
  ) as Record<string, SubscribeStatus>;
  templates.forEach((template) => (notificationSetting[template] = "enabled"));
  localStorage.setItem("notification", JSON.stringify(notificationSetting));
  return Object.fromEntries(templates.map((tmpl) => [tmpl, true]));
};

/** @todo simulated authorization UI */
export const login = async () => {
  console.debug("login");
  return "00168";
};
