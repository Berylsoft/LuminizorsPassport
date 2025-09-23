import { ref } from "vue";
import { useAPI } from "@/composables/api";
import { useUserStore } from "@/stores/user";
import { getErrMsg } from "@/utils";
import { RequestHelper } from "./apis/helper";

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
    throw new Error(`Login failed: ${getErrMsg(err)}`);
  }
};

const checkLoginStatus = async () => {
  const API = useAPI();
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

const signOut = async () => {
  const API = useAPI();
  const userStore = useUserStore();
  await API.revokeAllTokens();
  userStore.id = "";
};

export const useAccount = () => ({ checkLoginStatus, login, signOut });
