<template>
  <view
    class="file-uploader"
    :style="{ '--file-uploader-size': sizeTransformed }"
  >
    <nut-badge
      class="badge"
      :hidden="choosed"
      color="var(--text-color-secondary)"
    >
      <template #icon>
        <Icon
          class="clear-icon"
          name="dismiss"
          size="calc(var(--file-uploader-size) / 5)"
          @click="onClear"
        />
      </template>
      <file-chooser
        v-model="file"
        :accepted-extensions="config.upload.acceptedExtensions"
        :accepted-mime-types="config.upload.acceptedMimeTypes"
        @selected="onSelected"
      >
        <file-component :file :size />
      </file-chooser>
    </nut-badge>
    <view class="status">
      <Icon
        class="status-icon"
        :name="icon.name"
        :color="icon.color"
        size="calc(var(--file-uploader-size) * 0.18)"
        :animate="icon.animate"
      />
      <view class="status-text">{{ statusText }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { computed, ref } from "vue";
import FileComponent from "@/components/File.vue";
import FileChooser from "@/components/FileChooser.vue";
import Icon from "@/components/Icon.vue";
import { useConfig } from "@/composables/config";
import { UploadError, useUpload } from "@/composables/upload";
import type { File } from "@/types";
import { platform } from "@/platforms";

const { projectId, size = 150 } = defineProps<{
  projectId: number;
  size?: number | string;
}>();

const config = useConfig();
const { upload } = useUpload();

const file = ref<File.File | undefined>();
const status = ref<File.UploadStatus>("unselected");
const abort = ref<AbortController>(new AbortController());

const sizeTransformed = computed(() =>
  typeof size === "number" ? Taro.pxTransform(size) : size,
);
const icon = computed<{ name: string; color?: string; animate?: string }>(
  () => {
    switch (status.value) {
      case "init":
        return {
          name: "more-horizontal",
          color: "var(--theme-color)",
          animate: "blink",
        };
      case "uploading":
        return {
          name: "arrow-sync",
          color: "var(--theme-color)",
          animate: "rotate",
        };
      case "success":
        return { name: "checkmark-circle", color: "green" };
      case "error":
        return { name: "error-circle", color: "red" };
      default:
        return { name: "" };
    }
  },
);
const statusText = computed(() => {
  switch (status.value) {
    case "init":
      return "等待中";
    case "uploading":
      return "上传中";
    case "success":
      return "上传成功";
    case "error":
      return "上传失败";
    default:
      return "";
  }
});
const choosed = computed(() => file.value === undefined);

const onSelected = async (file: File.File) => {
  status.value = "init";
  try {
    await upload(file, { abortSignal: abort.value.signal, projectId });
    status.value = "success";
  } catch (err) {
    status.value = "error";
    if (err instanceof UploadError)
      void platform.showToast({ title: err.message, duration: 3000 });
    throw err;
  }
};

const onClear = () => {
  file.value = undefined;
  status.value = "unselected";
  abort.value.abort();
};
</script>

<style lang="scss">
.file-uploader {
  line-height: 0;

  .badge {
    height: var(--file-uploader-size);

    .clear-icon {
      color: var(--background-color);
    }
  }
  .status {
    height: calc(var(--file-uploader-size) / 5);
    width: var(--file-uploader-size);
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    .status-text {
      font-size: calc(var(--file-uploader-size) / 5);
      color: var(--text-color-secondary);
    }
  }
}
</style>
