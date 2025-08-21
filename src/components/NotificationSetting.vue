<template class="notification-setting">
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="notification-setting-content"
    round
    @click-overlay="() => (show = false)"
  >
    <nut-space direction="vertical" fill :gutter="20">
      <view class="title"> 通知设置 </view>
      <view class="status">
        订阅状态:
        <span v-if="status === 'enabled'" style="color: green">已订阅</span>
        <span v-else-if="status === 'disabled'" style="color: red">已禁用</span>
        <span v-else style="color: var(--text-color-secondary)">未配置</span>
      </view>
      <view class="button">
        <nut-button
          v-if="status === 'unconfigured'"
          type="primary"
          @click="subscribeNotification"
        >
          点击订阅
        </nut-button>
        <nut-button v-else type="primary" @click="openSetting">
          打开设置
        </nut-button>
      </view>
    </nut-space>
  </nut-popup>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useNotification } from "@/composables/notification";
import { platform } from "@/platforms";
import type { SubscribeStatus } from "@/platforms/types";

const show = defineModel<boolean>();

const { getSubscribeStatus, subscribe } = useNotification();

const status = ref<SubscribeStatus>("unconfigured");
const updateStatus = async () => {
  status.value = await getSubscribeStatus();
};

const subscribeNotification = async () => {
  await subscribe();
  await updateStatus();
};

const openSetting = async () => {
  await platform.openSetting();
  await updateStatus();
};

onMounted(updateStatus);
</script>
<style lang="scss">
.notification-setting-content {
  padding: 20px;
  text-align: center;
  width: 500px;

  .title {
    color: var(--text-color-primary);
    font-size: 40px;
  }

  .status {
    color: var(--text-color-primary);
    font-size: 28px;
  }
}
</style>
