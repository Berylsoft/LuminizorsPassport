import { ref } from "vue";
import { useAPI } from "@/composables/api";
import { platform } from "@/platforms";
import { useUserStore } from "@/stores/user";
import { RequestHelper } from "./apis/helper";

const API = useAPI();

/** @private */
export const _loginPromises: [
  (value: string) => void,
  (reason?: unknown) => void,
][] = [];
/** @private */
export const _showLogin = ref(false);

const login = async () => {
  const userStore = useUserStore();
  if (userStore.isLoggedIn && (await checkLoginStatus())) {
    return;
  }
  _showLogin.value = true;
  try {
    const id = await new Promise<string>((res, rej) => {
      _loginPromises.push([res, rej]);
    });
    return id;
  } catch (err) {
    void platform.showToast({
      title: "登录失败",
      icon: "error",
    });
    throw new Error(
      `Login failed${err instanceof Error ? `: ${err.message}` : ""}`
    );
  }
};

const checkLoginStatus = async () => {
  const userStore = useUserStore();
  try {
    const { id } = await API.getInfo(null, {
      [RequestHelper.bypassLoginRetry]: true,
    });
    userStore.id = id.toString();
  } catch {
    userStore.id = "";
  }
  return userStore.isLoggedIn;
};

export const useAccount = () => ({ checkLoginStatus, login });
