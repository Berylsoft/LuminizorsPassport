import Taro from "@tarojs/taro";
import {
  OpenSettingResult,
  SubscribeNotificationResult,
  SubscribeStatus,
} from "./types";
import { promisify } from "@/utils";

export const name = "weapp";

export const showToast = async (options: {
  title: string;
  icon?: "success" | "error" | "loading";
  duration?: number;
}) => {
  const { title, icon = "none", duration = 2000 } = options;
  await Taro.showToast({ title, icon, duration });
};

export const setTitle = async (title: string) => {
  await Taro.setNavigationBarTitle({
    title,
  });
};

export const setClipboard = async (text: string) => {
  await Taro.setClipboardData({
    data: text,
  });
};

export const getSystemTheme = () => Taro.getAppBaseInfo().theme ?? "light";

export const onSystemThemeChange = (
  callback: (theme: "light" | "dark") => void,
) => {
  Taro.onThemeChange(({ theme }) => {
    callback(theme);
  });
};

export const getPrivacySetting = () => promisify(Taro["getPrivacySetting"])({});

export const openPrivacyContract = async () =>
  void (await promisify(Taro["openPrivacyContract"])({}));

export const requirePrivacyAuthorize = async () => {
  try {
    await promisify(Taro["requirePrivacyAuthorize"])({});
    return true;
  } catch {
    return false;
  }
};

export const openSetting = (config?: {
  withSubscriptions?: boolean;
}): Promise<OpenSettingResult> => Taro.openSetting(config);

export const getNoticificationSubscribeStatus = async (
  template: string,
): Promise<SubscribeStatus> => {
  const { subscriptionsSetting } = await Taro.getSetting({
    withSubscriptions: true,
  });
  if (!subscriptionsSetting.mainSwitch) {
    return "disabled";
  } else if (
    !(
      subscriptionsSetting.itemSettings as Record<string, string> | undefined
    )?.[template]
  ) {
    return "unconfigured";
  } else {
    return subscriptionsSetting.itemSettings[template] === "accept"
      ? "enabled"
      : "disabled";
  }
};

export const subscribeNotification = async (
  templates: string[],
): Promise<SubscribeNotificationResult> => {
  const result = await Taro.requestSubscribeMessage({
    tmplIds: templates,
    entityIds: templates,
  });
  if (result.errCode) {
    throw new Error(`${result.errMsg}(${result.errCode.toString()})`);
  } else {
    return Object.fromEntries(
      templates.map((tmpl) => [tmpl, result[tmpl] === "accept"]),
    );
  }
};

export const login = async () => {
  const { code } = await Taro.login();
  if (code) {
    return code;
  } else {
    throw new Error("Login canceled");
  }
};
