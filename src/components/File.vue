<template>
  <nut-avatar
    class="file-container"
    bg-color="var(--background-color)"
    shape="square"
    :style="{
      cursor: file ? 'default' : 'pointer',
      '--file-container-size': sizeTransformed,
    }"
  >
    <Icon
      class="file-icon"
      :name="icon"
      size="calc(var(--file-container-size) / 2.5)"
    />
    <view class="file-text">{{ file?.name ?? defaultText }}</view>
  </nut-avatar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { File } from "@/types";
import Taro from "@tarojs/taro";
import Icon from "@/components/Icon.vue";

const {
  file,
  size = 150,
  defaultText = "选择文件",
  defaultIcon = "add",
} = defineProps<{
  file: File.File | undefined;
  size?: number | string;
  defaultText?: string;
  defaultIcon?: string;
}>();

const sizeTransformed = computed(() =>
  typeof size === "number" ? Taro.pxTransform(size) : size,
);
const icon = computed(() => {
  if (file) {
    switch (file.type.split("/")[0]) {
      case "audio":
        return "music-note-2";
      case "image":
        return "image";
      case "text":
        return "document-text";
      case "video":
        return "video";
      default:
        return "document-question";
    }
  } else {
    return defaultIcon;
  }
});
</script>

<style lang="scss">
.file-container {
  width: var(--file-container-size);
  height: var(--file-container-size);
  border: 2px dashed var(--text-color-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .file-icon {
    color: var(--theme-color);
    flex: 1 0 auto;
    position: relative;
    top: 0;
    left: 0;
    transform: none;
  }
  .file-text {
    color: var(--text-color-secondary);
    flex: 1 1 auto;
    font-size: calc(var(--file-container-size) / 5);
    line-height: normal;
    word-break: break-all;
    overflow: hidden;
  }
}
</style>
