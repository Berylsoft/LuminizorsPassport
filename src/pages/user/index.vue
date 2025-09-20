<template>
  <view>
    <view class="user-info">
      <nut-cell
        v-if="userStore.isLoggedIn"
        center
        desc-text-align="center"
        :round-radius="20"
        size="large"
      >
        <template #icon>
          <nut-avatar size="large">
            <Icon name="person" :size="40" />
          </nut-avatar>
        </template>
        <template #desc>
          <span class="passport-id-text"> 通行证ID: </span>
          <span class="passport-id-number">{{ userStore.id }}</span>
        </template>
      </nut-cell>
      <nut-cell
        v-else
        center
        is-link
        :round-radius="20"
        size="large"
        @click="account.login"
      >
        <template #icon>
          <nut-avatar size="large">
            <Icon name="person" :size="80" />
          </nut-avatar>
        </template>
        <template #desc>
          <span class="click-to-login">点击登录</span>
        </template>
        <template #link></template>
      </nut-cell>
    </view>
    <view class="theme-selector">
      <nut-cell title="深色模式" :round-radius="10">
        <template #icon>
          <Icon class="cell-icon" name="paint_brush" />
        </template>
        <template #link>
          <nut-radio-group v-model="themeStore.theme" direction="horizontal">
            <nut-radio
              class="radio-button"
              label="auto"
              shape="button"
              size="mini"
            >
              <Icon name="arrow-sync" :size="32" />
            </nut-radio>
            <nut-radio
              class="radio-button"
              label="light"
              shape="button"
              size="mini"
            >
              <Icon name="weather-sunny" :size="32" />
            </nut-radio>
            <nut-radio
              class="radio-button"
              label="dark"
              shape="button"
              size="mini"
            >
              <Icon name="dark-theme" :size="32" />
            </nut-radio>
          </nut-radio-group>
        </template>
      </nut-cell>
    </view>
    <view class="notification-setting">
      <nut-cell
        is-link
        :round-radius="10"
        title="通知设置"
        @click="showNotificationSetting = true"
      >
        <template #icon>
          <Icon class="cell-icon" name="alert" />
        </template>
      </nut-cell>
    </view>
    <!-- temporary disable -->
    <view v-if="false" class="feedback">
      <nut-cell
        is-link
        :round-radius="10"
        title="意见反馈"
        @click="showFeedback = true"
      >
        <template #icon>
          <Icon class="cell-icon" name="chat-help" />
        </template>
      </nut-cell>
    </view>
    <view class="privacy-policy">
      <nut-cell
        is-link
        title="隐私政策"
        :round-radius="10"
        @click="platform.openPrivacyContract"
      >
        <template #icon>
          <Icon class="cell-icon" name="shield-video" />
        </template>
      </nut-cell>
    </view>
    <view class="about">
      <nut-cell
        is-link
        title="关于"
        :round-radius="10"
        @click="showAbout = true"
      >
        <template #icon>
          <Icon class="cell-icon" name="info" />
        </template>
      </nut-cell>
    </view>
    <view v-if="userStore.isLoggedIn" class="logout">
      <nut-cell
        is-link
        :round-radius="10"
        title="退出登录"
        @click="showSignOutDialog = true"
      >
        <template #icon>
          <Icon class="cell-icon" name="sign-out" />
        </template>
      </nut-cell>
    </view>
  </view>
  <view>
    <About v-model="showAbout" />
    <Feedback v-model="showFeedback" />
    <NotificationSetting v-model="showNotificationSetting" />
    <view>
      <nut-dialog
        v-model:visible="showSignOutDialog"
        title="提示"
        content="确定要退出登录吗?"
        @ok="account.signOut"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import About from "@/components/About.vue";
import Feedback from "@/components/Feedback.vue";
import NotificationSetting from "@/components/NotificationSetting.vue";
import Icon from "@/components/Icon.vue";
import { useAccount } from "@/composables/account";
import { useThemeStore } from "@/stores/theme";
import { useUserStore } from "@/stores/user";
import { platform } from "@/platforms";

const account = useAccount();
const themeStore = useThemeStore();
const userStore = useUserStore();

const showAbout = ref(false);
const showFeedback = ref(false);
const showNotificationSetting = ref(false);
const showSignOutDialog = ref(false);
</script>

<style lang="scss">
.user-info {
  .passport-id-text {
    font-size: 16px;
    color: var(--text-color-secondary);
  }
  .passport-id-number {
    font-size: 20px;
    color: var(--text-color-primary);
  }
  .click-to-login {
    margin: 0 10px;
    color: var(--text-color-secondary);
  }
}
.theme-selector .radio-button {
  margin-bottom: 0;
}
.cell-icon {
  color: var(--theme-color-reverse);
}
</style>
