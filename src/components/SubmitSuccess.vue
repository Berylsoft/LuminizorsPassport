<template>
  <nut-popup
    v-if="show"
    v-model:visible="show"
    :close-on-click-overlay="false"
    pop-class="submit-success-content"
    round
  >
    <view class="success-icon">
      <Icon name="checkmark-circle" :size="150" />
    </view>
    <view class="success-text">
      {{ isFirstReview ? "初审提交" : "正式提交" }}成功, 请耐心等待审核结果
    </view>
    <template v-if="subscribeStatus === 'unconfigured'">
      <view class="tips">
        即将申请通知权限, 请务必选择允许, 否则将无法及时收到审核结果
      </view>
    </template>
    <template v-else-if="subscribeStatus === 'enabled'">
      <view class="tips">{{ redirectCoutdown }} 秒将后自动返回项目页面</view>
      <view class="buttons">
        <nut-button type="primary" @click="returnToProject">
          立即返回
        </nut-button>
      </view>
    </template>
    <template v-else-if="subscribeStatus === 'disabled'">
      <view class="warn">
        检测到您已拒绝订阅通知, 可能无法及时收到审核结果!
      </view>
      <view class="buttons">
        <nut-button type="default" @click="returnToProject">
          直接返回
        </nut-button>
        <nut-button type="primary" @click="platform.openSetting()">
          打开通知设置
        </nut-button>
      </view>
    </template>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import Icon from "@/components/Icon.vue";
import { useNotification } from "@/composables/notification";
import { platform, type SubscribeStatus } from "@/platforms";
import { sleep } from "@/utils";

const show = defineModel<boolean>();
const props = defineProps<{ projectId: number; isFirstReview?: boolean }>();

const notification = useNotification();
const router = useRouter();

const subscribeStatus = ref<SubscribeStatus>();
const redirectCoutdown = ref(5);

watch(
  show,
  async (show) => {
    if (show) {
      subscribeStatus.value = await notification.getSubscribeStatus();
    }
  },
  { immediate: true },
);
watch(subscribeStatus, async (status, oldStatus) => {
  if (status === oldStatus) return;
  switch (status) {
    case "enabled": {
      void platform.showToast({
        title: "审核结果订阅成功",
      });
      redirectCoutdown.value = 5;
      const interval = setInterval(() => {
        redirectCoutdown.value--;
        if (redirectCoutdown.value === 0) {
          clearInterval(interval);
          void returnToProject();
        }
      }, 1000);
      break;
    }
    case "disabled": {
      void platform.showToast({
        title: "审核结果订阅失败",
      });
      break;
    }
    case "unconfigured": {
      await sleep(2000);
      const result = await notification.subscribe();
      subscribeStatus.value = Object.values(result).includes(false)
        ? "disabled"
        : "enabled";
      break;
    }
  }
});

const returnToProject = () =>
  router.push({ name: "project-overview", params: { id: props.projectId } });
</script>

<style lang="scss">
.submit-success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 600px;
  height: 450px;
  padding: 50px 20px;
  text-align: center;

  .success-icon {
    color: var(--theme-color);
  }
  .success-text {
    margin-bottom: 10px;
    color: var(--text-color-primary);
    font-size: 32px;
  }
  .tips {
    color: var(--text-color-secondary);
    font-size: 30px;
  }
  .warn {
    color: red;
    font-weight: bold;
    font-size: 32px;
  }
  .buttons {
    width: 100%;
    margin-top: 30px;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
  }
}
</style>
