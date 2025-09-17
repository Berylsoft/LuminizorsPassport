<template>
  <view class="file-chooser">
    <template v-if="platform.name === 'web'">
      <label
        class="chooser-container"
        :for="choosed ? 'file-input' : 'disabled'"
      >
        <slot></slot>
      </label>
      <INPUT
        id="file-input"
        ref="file-input"
        class="file-chooser-input"
        :accept="acceptedExtensions.map((ext) => `.${ext}`).join()"
        type="file"
        @change="onInputChange"
      />
    </template>
    <template v-else>
      <view class="chooser-container" @click="chooseFile">
        <slot></slot>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { computed, useTemplateRef } from "vue";
import { platform } from "@/platforms";
import { type CommonFile, WebFile, TaroFSFile } from "@/utils";

const file = defineModel<CommonFile | undefined>();
const { acceptedExtensions = [], acceptedMimeTypes = [] } = defineProps<{
  acceptedExtensions?: string[];
  acceptedMimeTypes?: string[];
}>();

const emit = defineEmits<{
  selected: [CommonFile];
}>();

const choosed = computed(() => file.value === undefined);

const onSelected = async (f: CommonFile) => {
  const type = await f.getType();
  if (
    acceptedMimeTypes.length === 0 ||
    acceptedMimeTypes.includes(type?.mime ?? "")
  ) {
    file.value = f;
    emit("selected", f);
  } else {
    void platform.showToast({
      title: `暂不支持${type?.ext ?? "此类型的"}文件`,
    });
    return;
  }
};

// web
const inputElement = useTemplateRef<HTMLInputElement | null>("file-input");
const onInputChange = async () => {
  const inputFile = inputElement.value?.files?.[0];
  if (inputFile) {
    await onSelected(new WebFile(inputFile));
  }
};

// weapp
const chooseFile = async () => {
  const result = await Taro.chooseMessageFile({
    count: 1,
    type: "file",
    extension: [
      ...acceptedExtensions,
      ...acceptedExtensions.map((ext) => `.${ext}`),
    ],
  });
  const file = result.tempFiles[0];
  if (file) {
    await onSelected(new TaroFSFile(file));
  }
};
</script>

<style lang="scss">
.file-chooser {
  display: inline;
  .file-chooser-input {
    opacity: 0;
    width: 0;
    height: 0;
  }
}
</style>
