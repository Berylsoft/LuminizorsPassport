<template>
  <nut-popup
    v-if="showLogin"
    v-model:visible="showLogin"
    pop-class="login-content"
    round
    @click-overlay="cancelLogin"
  >
    <nut-space direction="vertical" fill :gutter="20">
      <view class="login-container">
        <view class="login-title">登录</view>
      </view>
      <view class="login-button">
        <nut-button
          :loading="isLoading"
          size="large"
          type="success"
          @click="login"
        >
          <template #icon>
            <Icon name="wechat" />
          </template>
          <template #default> 微信授权登录 </template>
        </nut-button>
      </view>
    </nut-space>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Icon from "@/components/Icon.vue";
import { _loginPromises, _showLogin } from "@/composables/account";
import { useAPI } from "@/composables/api";
import { platform } from "@/platforms";
import { useUserStore } from "@/stores/user";

const API = useAPI();
const userStore = useUserStore();

const showLogin = _showLogin;
const isLoading = ref(false);

const clearArray = (arr: unknown[]) => void arr.splice(0);

const login = async () => {
  isLoading.value = true;
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
  } catch {
    void platform.showToast({
      title: "登录失败",
      icon: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const cancelLogin = () => {
  _loginPromises.forEach(([, rej]) => {
    rej("Login canceled");
  });
  clearArray(_loginPromises);
  isLoading.value = false;
};
</script>

<style lang="scss">
.login-content {
  padding: 5%;
  text-align: center;
  width: 500px;
}
</style>
