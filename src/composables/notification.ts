import Taro from "@tarojs/taro";
import { useConfig } from "@/composables/config";
import { platform, type SubscribeStatus } from "@/platforms";

const config = useConfig();

const getSubscribeStatus = async (): Promise<SubscribeStatus> => {
  let result = true;
  let configured = false;
  for (const template of config.notification.templates) {
    const status = await platform.getNoticificationSubscribeStatus(template);
    switch (status) {
      case "enabled":
        configured = true;
        break;
      case "disabled":
        configured = true;
        result = false;
        break;
      case "unconfigured":
        break;
    }
  }
  return result ? "enabled" : configured ? "disabled" : "unconfigured";
};

const subscribe = async () => {
  try {
    switch (await getSubscribeStatus()) {
      case "disabled":
        await Taro.openSetting();
        break;
      case "unconfigured":
        await platform.subscribeNotification(config.notification.templates);
        break;
    }
  } catch (err) {
    if (err instanceof Error)
      await platform.showToast({
        title: `订阅失败: ${err.message}`,
      });
    throw err;
  }
  return await getSubscribeStatus();
};

export const useNotification = () => ({
  getSubscribeStatus,
  subscribe,
});
