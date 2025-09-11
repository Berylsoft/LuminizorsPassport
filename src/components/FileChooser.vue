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
import { fileTypeFromBlob, fileTypeFromStream } from "file-type";
import { md5 } from "hash-wasm";
import { computed, useTemplateRef } from "vue";
import { platform } from "@/platforms";
import { File } from "@/types";
import { createReadableStream, TaroFS } from "@/utils";

const file = defineModel<File.File | undefined>();
const { acceptedExtensions = [], acceptedMimeTypes = [] } = defineProps<{
  acceptedExtensions?: string[];
  acceptedMimeTypes?: string[];
}>();

const emit = defineEmits<{
  selected: [File.File];
}>();

const choosed = computed(() => file.value === undefined);

// web
const inputElement = useTemplateRef<HTMLInputElement | null>("file-input");
const onInputChange = async () => {
  const inputFile = inputElement.value?.files?.[0];
  if (inputFile) {
    const type = await fileTypeFromBlob(inputFile);
    if (
      acceptedMimeTypes.length === 0 ||
      acceptedMimeTypes.includes(type?.mime ?? "")
    ) {
      const f = {
        name: inputFile.name,
        path: inputElement.value.value,
        size: inputFile.size,
        type: type?.mime ?? "",
        calcMD5: async () => md5(await inputFile.bytes()),
        stream: () => inputFile.stream(),
      };
      file.value = f;
      emit("selected", f);
    } else {
      void platform.showToast({
        title: " 不支持的文件类型",
      });
      return;
    }
  }
};

// weapp
const chooseFile = async () => {
  const result = await Taro.chooseMessageFile({
    count: 1,
    type: "all",
  });
  const file = result.tempFiles[0];
  if (file) {
    const type = await fileTypeFromStream(createReadableStream(file.path));
    if (acceptedMimeTypes.includes(type?.mime ?? "")) {
      void platform.showToast({
        title: " 不支持的格式",
        icon: "error",
      });
      return;
    }
    emit("selected", {
      name: file.name,
      path: file.path,
      size: file.size,
      type: type?.mime ?? "",
      calcMD5: async () =>
        (
          await TaroFS.getFileInfo({
            filePath: file.path,
            digestAlgorithm: "md5",
          })
        ).digest!,
      stream: () => createReadableStream(file.path),
    });
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
