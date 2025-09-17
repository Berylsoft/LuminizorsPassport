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
import { computed, ref, watch } from "vue";
import Taro from "@tarojs/taro";
import Icon from "@/components/Icon.vue";
import type { CommonFile } from "@/utils";

const {
  file,
  size = 150,
  defaultText = "选择文件",
  defaultIcon = "add",
} = defineProps<{
  file: CommonFile | undefined;
  size?: number | string;
  defaultText?: string;
  defaultIcon?: string;
}>();

const sizeTransformed = computed(() =>
  typeof size === "number" ? Taro.pxTransform(size) : size,
);
const icon = ref(defaultIcon);

watch(
  () => file,
  async () => {
    if (file) {
      const type = (await file.getType())?.mime;
      switch (type?.split("/")[0]) {
        case "audio":
          icon.value = "music-note-2";
          break;
        case "image":
          icon.value = "image";
          break;
        case "text":
          icon.value = "document-text";
          break;
        case "video":
          icon.value = "video";
          break;
        default:
          icon.value = "document-question";
          break;
      }
    } else {
      icon.value = defaultIcon;
    }
  },
);
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
