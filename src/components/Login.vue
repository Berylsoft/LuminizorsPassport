<template>
  <nut-popup
    v-if="showLogin"
    v-model:visible="showLogin"
    pop-class="login-content"
    round
    @click-overlay="cancelLogin"
  >
    <view class="login-container">
      <view class="login-title">注册或登录</view>
    </view>
    <view class="privacy-policy">
      <Noci
        class="checkbox"
        :class="acceptPrivacyPolicy ? 'selected' : ''"
        :name="acceptPrivacyPolicy ? 'checkmark' : ''"
        :size="20"
        @click="privacyPolicyAuthorize"
      />
      我已阅读并同意
      <a class="privacy-policy-link" @click="platform.openPrivacyContract">{{
        privacyPolicyName
      }}</a>
    </view>
    <nut-button
      class="button login"
      :loading="loginButtonLoading"
      size="large"
      type="success"
      @click="login"
    >
      <template #icon>
        <Noci name="wechat" />
      </template>
      微信授权登录
    </nut-button>
    <nut-button
      class="button import"
      :disabled="importButtonDisabled"
      size="large"
      type="primary"
      @click="openImportUI"
    >
      <template #icon>
        <Noci name="arrow-import" />
      </template>
      导入数据并登录
    </nut-button>
  </nut-popup>
  <nut-popup
    v-model:visible="showImportUI"
    pop-class="import-content"
    round
    @click-overlay="showImportUI = false"
  >
    <FormItem
      title="导入数据并登录"
      description="如果您之前提交过问卷, 可在此处导入以前的进度"
      :error="usernameError"
    >
      <nut-input
        v-model.trim="username"
        clearable
        :error="Boolean(usernameError)"
        max-length="20"
        placeholder="请输入提交问卷的 QQ 昵称"
        show-word-limit
        type="text"
      />
    </FormItem>
    <nut-button
      class="import-button"
      :loading="importButtonLoading"
      size="normal"
      type="primary"
      @click="importAndLogin"
    >
      确定
    </nut-button>
  </nut-popup>
  <nut-popup
    v-model:visible="showLoginAsUI"
    pop-class="login-as-content"
    round
    @click-overlay="showLoginAsUI = false"
  >
    <FormItem
      title="使用token登录"
      description="请输入token"
      :error="tokenError"
    >
      <nut-input
        v-model.trim="token"
        clearable
        :error="Boolean(tokenError)"
        placeholder="token"
        type="text"
      />
    </FormItem>
    <nut-button
      class="login-as-button"
      :loading="loginAsButtonLoading"
      size="normal"
      type="primary"
      @click="loginAsUser"
    >
      确定
    </nut-button>
  </nut-popup>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import KonamiCode from "konami-code-js";
import { ref, watch } from "vue";
import FormItem from "@/components/FormItem.vue";
import Noci from "@/components/Noci.vue";
import { _loginPromises, _showLogin } from "@/composables/account";
import { useAPI } from "@/composables/api";
import { platform } from "@/platforms";
import { useUserStore } from "@/stores/user";
import { clearArray } from "@/utils";

const IMPORT_ERROR = new Error("import failed");

const API = useAPI();
const userStore = useUserStore();

const showLogin = _showLogin;
const showImportUI = ref(false);
const showLoginAsUI = ref(false);

const kc = new KonamiCode(() => (showLoginAsUI.value = true));
watch(
  showLogin,
  (show) => {
    Taro.nextTick(async () => {
      if (show) {
        kc.enable();
        const { needAuthorization, privacyContractName } =
          await platform.getPrivacySetting();
        privacyPolicyName.value = privacyContractName;
        acceptPrivacyPolicy.value = !needAuthorization;
      } else {
        kc.disable();
      }
    });
  },
  { immediate: true },
);

const privacyPolicyName = ref(`隐私政策`);
const acceptPrivacyPolicy = ref(false);
const privacyPolicyAuthorize = async () => {
  if (acceptPrivacyPolicy.value) acceptPrivacyPolicy.value = false;
  else acceptPrivacyPolicy.value = await platform.requirePrivacyAuthorize();
};

const loginButtonLoading = ref(false);
const loginAsButtonLoading = ref(false);
const importButtonLoading = ref(false);
const importButtonDisabled = ref(false);

const username = ref("");
const usernameError = ref<string>();
watch(username, (name) => {
  if (name.length === 0) usernameError.value = "昵称不能为空";
  else usernameError.value = undefined;
});

const token = ref("");
const tokenError = ref<string>();
watch(token, (name) => {
  if (name.length === 0) tokenError.value = "token 不能为空";
  else tokenError.value = undefined;
});

const login = async () => {
  if (!acceptPrivacyPolicy.value) {
    void platform.showToast({ title: "请先同意隐私政策" });
    return;
  }

  importButtonDisabled.value = true;
  loginButtonLoading.value = true;
  try {
    const code = await platform.login();
    await API.login({
      code,
    });

    const id = (await API.getInfo()).id.toString();
    userStore.id = id;
    _loginPromises.forEach(([res]) => {
      res(id);
    });
    clearArray(_loginPromises);
    showLogin.value = false;
  } catch {
    void platform.showToast({
      title: `登录失败`,
      icon: "error",
    });
  } finally {
    importButtonDisabled.value = false;
    loginButtonLoading.value = false;
  }
};

const openImportUI = () => {
  if (!acceptPrivacyPolicy.value) {
    void platform.showToast({ title: "请先同意隐私政策" });
  } else {
    showImportUI.value = true;
  }
};

const importAndLogin = async () => {
  if (username.value === "") {
    void platform.showToast({
      title: "昵称不能为空",
      icon: "error",
    });
    return;
  }
  importButtonLoading.value = true;
  try {
    const code = await platform.login();
    const res = await API.importUser({
      code,
      uname: username.value,
    });
    if (res === "InvalidReq") {
      void platform.showToast({
        title: "导入失败, 请检查昵称是否正确或联系管理员",
        duration: 3000,
      });
      throw IMPORT_ERROR;
    }

    const id = (await API.getInfo()).id.toString();
    userStore.id = id;
    _loginPromises.forEach(([res]) => {
      res(id);
    });
    clearArray(_loginPromises);
    showImportUI.value = false;
  } catch (err) {
    if (err !== IMPORT_ERROR)
      void platform.showToast({
        title: `登录失败`,
        icon: "error",
      });
  } finally {
    importButtonLoading.value = false;
  }
};

const loginAsUser = async () => {
  if (token.value === "") {
    void platform.showToast({
      title: `请输入token`,
      icon: "error",
    });
    return;
  }
  loginAsButtonLoading.value = true;
  try {
    await API.loginAs({
      token: token.value,
    });

    const id = (await API.getInfo()).id.toString();
    userStore.id = id;
    _loginPromises.forEach(([res]) => {
      res(id);
    });
    clearArray(_loginPromises);
    showLoginAsUI.value = false;
  } catch {
    void platform.showToast({
      title: `登录失败`,
      icon: "error",
    });
  } finally {
    loginAsButtonLoading.value = false;
  }
};

const cancelLogin = () => {
  _loginPromises.forEach(([, rej]) => {
    rej("Login canceled");
  });
  clearArray(_loginPromises);
  showLogin.value = false;
};
</script>

<style lang="scss">
.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  width: 600px;

  .login-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  .privacy-policy {
    display: flex;
    flex-direction: row wrap;
    align-items: center;
    margin: 15px 0;
    font-size: 24px;
    color: var(--text-color-secondary);
    --nut-checkbox-margin-right: 0;

    .checkbox {
      padding: 3px;
      border: 2px solid var(--text-color-secondary);
      border-radius: 50%;
      margin-right: 10px;

      &.selected {
        background-color: var(--theme-color);
        border-color: var(--theme-color);
        color: white;
      }
    }
    .privacy-policy-link {
      margin-left: 10px;
      color: var(--theme-color);
      cursor: pointer;
    }
  }
  .button {
    margin-top: 20px;
    width: 400px;
  }
}
.import-content {
  padding: 50px 20px;
  text-align: center;
  width: 600px;

  .import-button {
    margin-top: 30px;
  }
}
.login-as-content {
  padding: 50px 20px;
  text-align: center;
  width: 600px;

  .login-as-button {
    margin-top: 30px;
  }
}
</style>
