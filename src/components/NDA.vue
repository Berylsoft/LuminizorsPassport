<template class="nda">
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="nda-content"
    round
    @click-overlay="() => (show = false)"
  >
    <view class="hint"> 请认真阅读协议条款: </view>
    <view class="nda-container">
      <nut-backtop :bottom="100" :right="40" :distance="200" height="50vh">
        <template #content>
          <view class="content"
            >{{ props.project.nda_info?.["Pending"] }}
          </view>
        </template>
      </nut-backtop>
    </view>
    <view class="buttons">
      <nut-button type="default" @click="() => (show = false)">
        取消
      </nut-button>
      <nut-button
        :disabled="agreeButtonDisabled"
        :loading="loading"
        type="primary"
        @click="agree"
      >
        同意以上协议{{
          agreeButtonDisabled
            ? `(${config.NDA.minReadingTime - readingTime}s)`
            : ""
        }}
      </nut-button>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useAPI } from "@/composables/api";
import { useConfig } from "@/composables/config";
import { platform } from "@/platforms";
import { Project } from "@/types";

const show = defineModel<boolean>();
const props = defineProps<{
  project: Project.ProjectDetail;
  projectId: number;
}>();
const emit = defineEmits(["onSuccess"]);

const API = useAPI();
const config = useConfig();

const readingTime = ref(0);
const agreeButtonDisabled = computed(
  () => readingTime.value < config.NDA.minReadingTime,
);
const loading = ref(false);
let interval: ReturnType<typeof setInterval>;
watch(
  show,
  () => {
    if (show.value) {
      interval = setInterval(() => {
        readingTime.value++;
      }, 1000);
    } else {
      clearInterval(interval);
      readingTime.value = 0;
    }
  },
  { immediate: true },
);

const agree = async () => {
  loading.value = true;
  try {
    await API.agreeNDA({ pid: props.projectId });
  } finally {
    loading.value = false;
  }
  void platform.showToast({ title: "签署成功", icon: "success" });
  show.value = false;
  emit("onSuccess");
};
</script>

<style lang="scss">
.nda-content {
  padding: 5%;
  text-align: center;
  width: 600px;

  .hint {
    font-size: 36px;
    color: var(--theme-color-dark);
    text-align: left;
  }
  .nda-container {
    margin: 30px 15px;

    .content {
      white-space: pre-wrap;
      font-size: 28px;
      color: var(--text-color-primary);
    }
  }
  .buttons {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
  }
}
</style>
