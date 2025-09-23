<template>
  <view
    class="file-uploader"
    :style="{ '--file-uploader-size': sizeTransformed }"
  >
    <nut-badge
      class="badge"
      :hidden="hideClearButton"
      color="var(--text-color-secondary)"
    >
      <template #icon>
        <Noci
          class="clear-icon"
          name="dismiss"
          size="calc(var(--file-uploader-size) / 5)"
          @click="onClear"
        />
      </template>
      <file-chooser
        v-model="choosedFile"
        :accepted-extensions="config.upload.acceptedExtensions"
        :accepted-mime-types="config.upload.acceptedMimeTypes"
        :readonly="readonly"
        @selected="onSelected"
      >
        <FileComponent :file="choosedFile" :size />
      </file-chooser>
    </nut-badge>
    <view class="status">
      <Noci
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
import { computed, nextTick, ref, watch } from "vue";
import FileComponent from "@/components/File.vue";
import FileChooser from "@/components/FileChooser.vue";
import Noci from "@/components/Noci.vue";
import { useConfig } from "@/composables/config";
import { UploadError, useUpload } from "@/composables/upload";
import { platform } from "@/platforms";
import { File } from "@/types";
import { type CommonFile, humanizeBytes } from "@/utils";

const file = defineModel<File.FileUpload>({ required: true });

const {
  projectId,
  fileSizeMin = 0,
  fileSizeMax = Infinity,
  readonly,
  size = 150,
} = defineProps<{
  projectId: number;
  fileSizeMin?: number | undefined;
  fileSizeMax?: number | undefined;
  readonly?: boolean;
  size?: number | string;
}>();

const emit = defineEmits<{
  clear: [File.FileUpload];
  success: [number];
}>();

const config = useConfig();
const { upload } = useUpload();

const choosedFile = ref<CommonFile>();
watch(choosedFile, (f) => {
  file.value.file = f;
});

const sizeTransformed = computed(() =>
  typeof size === "number" ? Taro.pxTransform(size) : size,
);
const icon = computed<{ name: string; color?: string; animate?: string }>(
  () => {
    switch (file.value.status) {
      case File.UploadStatus.Initialization:
        return {
          name: "more-horizontal",
          color: "var(--theme-color)",
          animate: "blink",
        };
      case File.UploadStatus.Uploading:
        return {
          name: "arrow-sync",
          color: "var(--theme-color)",
          animate: "rotate",
        };
      case File.UploadStatus.Success:
        return { name: "checkmark-circle", color: "green" };
      case File.UploadStatus.Error:
        return { name: "error-circle", color: "red" };
      default:
        return { name: "" };
    }
  },
);
const statusText = computed(() => {
  switch (file.value.status) {
    case File.UploadStatus.Initialization:
      return "等待中";
    case File.UploadStatus.Uploading:
      return "上传中";
    case File.UploadStatus.Success:
      return "上传成功";
    case File.UploadStatus.Error:
      return "上传失败";
    default:
      return "";
  }
});
const hideClearButton = computed(
  () => file.value.file === undefined || readonly,
);

const onSelected = async () => {
  await nextTick();
  if (choosedFile.value === undefined) {
    return;
  } else if (choosedFile.value.size < fileSizeMin) {
    void platform.showToast({
      title: `单个文件大小不能小于${humanizeBytes(fileSizeMin)}`,
      duration: 3000,
    });
    return;
  } else if (choosedFile.value.size > fileSizeMax) {
    void platform.showToast({
      title: `单个文件大小不能超过${humanizeBytes(fileSizeMax)}`,
      duration: 3000,
    });
    return;
  }

  file.value.abort = new AbortController();
  try {
    const id = await upload(file.value, projectId);
    file.value.status = File.UploadStatus.Success;
    emit("success", id);
  } catch (err) {
    file.value.status = File.UploadStatus.Error;
    if (err instanceof Error) file.value.error = err;
    if (err instanceof UploadError)
      void platform.showToast({ title: err.message, duration: 3000 });
    throw err;
  }
};

const onClear = () => {
  file.value.abort?.abort();
  emit("clear", file.value);
  file.value = { status: File.UploadStatus.Unselected };
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
    overflow: hidden;

    .status-text {
      font-size: calc(var(--file-uploader-size) / 5);
      color: var(--text-color-secondary);
    }
  }
}
</style>
