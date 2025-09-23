<template>
  <view class="file-list">
    <nut-cell
      v-for="file in files"
      :key="file.id"
      class="file-list-item"
      :class="file.selected ? 'selected' : ''"
      :is-link="!props.readonly && props.selectable"
      :round-radius="10"
      @click="onSelect(file)"
    >
      <template #title>
        <view class="file-name">
          {{ file.name }}
        </view>
      </template>
      <template #icon>
        <Noci class="file-icon" :name="getIcon(file)" />
      </template>
      <template #link>
        <Noci
          v-if="props.selectable"
          class="file-select"
          :name="file.selected ? 'checkmark' : ''"
          :size="26"
        />
        <Noci
          v-if="props.deleteable"
          class="file-delete"
          name="delete"
          :size="40"
          @click.stop="onDelete(file)"
        />
      </template>
    </nut-cell>
  </view>
  <nut-dialog
    v-model:visible="showDialog"
    title="提示"
    :content="dialogContent"
    @ok="onConfirm()"
  />
</template>

<script setup lang="ts">
import mime from "mime/lite";
import { ref } from "vue";
import Noci from "@/components/Noci.vue";
import { platform } from "@/platforms";
import { File } from "@/types";

const files = defineModel<File.FileList>({ required: true });
const props = defineProps<{
  readonly?: boolean;
  selectable?: boolean;
  deleteable?: boolean;
}>();
const emit = defineEmits<{
  delete: [File.FileListItem];
}>();

const showDialog = ref(false);
const dialogContent = ref("");
const onConfirm = ref(() => {});

const getIcon = (file: File.FileListItem) => {
  const type = file.type ?? mime.getType(file.name);
  switch (type?.split("/")[0]) {
    case "audio":
      return "music-note-2";
    case "image":
      return "image";
    case "text":
      return "document-text";
    case "video":
      return "video";
    default:
      return "document-question-mark";
  }
};

const onSelect = (file: File.FileListItem) => {
  if (!props.readonly && props.selectable) {
    file.selected = !file.selected;
  }
};

const onDelete = (file: File.FileListItem) => {
  if (!props.readonly) {
    dialogContent.value = `确定要删除文件 ${file.name} 吗?`;
    onConfirm.value = () => {
      deleteFile(file);
    };
    showDialog.value = true;
  }
};

const deleteFile = (file: File.FileListItem) => {
  const index = files.value.findIndex((f) => f === file);
  if (index === -1) {
    void platform.showToast({ title: "文件不存在", icon: "error" });
  } else {
    files.value.splice(index, 1);
    emit("delete", file);
  }
};
</script>

<style lang="scss">
.file-list .file-list-item {
  height: 60px;
  align-items: center;
  --nut-checkbox-margin-right: 10px;

  .file-icon {
    color: var(--theme-color);
  }
  .file-name {
    color: var(--text-color-secondary);
    font-size: 32px;
    margin-left: 20px;
  }
  .file-select {
    padding: 5px;
    border: 2px solid var(--text-color-secondary);
    border-radius: 50%;
  }
  .file-delete {
    margin-left: 15px;
    color: red;
  }
  &.selected {
    .file-name {
      color: var(--text-color-primary);
    }
    .file-select {
      background-color: var(--theme-color);
      border-color: var(--theme-color);
      color: white;
    }
  }
}
</style>
