<template>
  <nut-sticky>
    <view class="formal-submit-header">
      <view class="text recruit">征集</view>
      <Noci
        class="icon-arrow-right"
        name="chevron-right"
        color="var(--text-color-secondary)"
        :size="25"
      />
      <router-link
        class="text project-name"
        :to="{ name: 'project-overview', params: { id: projectId } }"
      >
        {{ projectDetail?.info.name }}
      </router-link>
      <Noci class="icon-arrow-right" name="chevron-right" :size="25" />
      <view class="text formal-submit">正式提交</view>
    </view>
  </nut-sticky>
  <view class="formal-submit-form">
    <nut-space direction="vertical" fill :gutter="10">
      <nut-cell class="audio-uploader" size="large" :round-radius="20">
        <nut-space direction="vertical" fill :gutter="20">
          <FormItem
            title="上传音频"
            :description="`支持格式: ${config.upload.acceptedExtensions.join(', ')}`"
          >
            <FileUploader
              v-model="file"
              class="file-uploader"
              :file-size-min="projectDetail?.info.pre_submit_file_size_min"
              :file-size-max="projectDetail?.info.pre_submit_file_size_max"
              :project-id
              :readonly="readOnly"
              @success="onUploadSuccess"
              @clear="onClear"
            />
            <FileList
              v-model="uploadedFiles"
              deleteable
              selectable
              @delete="onDelete"
            />
          </FormItem>
          <FormItem
            v-if="firstReviewFile.length > 0"
            title="初审音频"
            description="可在下方选择初审音频一起提交"
          >
            <FileList v-model="firstReviewFile" selectable />
          </FormItem>
        </nut-space>
      </nut-cell>
      <nut-cell size="large" :round-radius="20">
        <FormItem title="备注" :error="commentError">
          <nut-textarea
            v-model.trim="comment"
            clearable
            limit-show
            :max-length="200"
            placeholder="请输入备注(选填)"
            :readonly="readOnly"
          />
        </FormItem>
      </nut-cell>
    </nut-space>
    <view class="action-buttons-placeholder"></view>
  </view>
  <view class="action-buttons-container">
    <nut-button
      class="button cancel"
      :disabled="readOnly"
      size="large"
      type="default"
      @click="cancel"
    >
      取消
    </nut-button>
    <nut-button
      class="button submit"
      :loading="submitButtonLoading"
      size="large"
      type="primary"
      @click="submit"
    >
      提交
    </nut-button>
  </view>
  <view>
    <SubmitSuccess
      v-model="showSubmitSuccess"
      :project-id="projectId"
      :is-first-review="false"
    />
    <nut-dialog
      v-model:visible="showErrorDialog"
      :close-on-click-overlay="false"
      no-cancel-btn
      @ok="router.back()"
    >
      <view class="error-dialog"> 当前状态无法提交 </view>
    </nut-dialog>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import FileList from "@/components/FileList.vue";
import FileUploader from "@/components/FileUploader.vue";
import Noci from "@/components/Noci.vue";
import FormItem from "@/components/FormItem.vue";
import SubmitSuccess from "@/components/SubmitSuccess.vue";
import { useAPI } from "@/composables/api";
import { useConfig } from "@/composables/config";
import { File, type Project } from "@/types";
import { platform } from "@/platforms";
import { cleanUnusedFiles } from "@/utils";

const API = useAPI();
const config = useConfig();
const route = useRoute();
const router = useRouter();

const projectId = ref(+route.params["id"]!);
const projectDetail = ref<Project.ProjectDetail>();
onMounted(async () => {
  projectDetail.value = await API.projectInfo({ pid: projectId.value });
});
onBeforeRouteUpdate(async (to, from) => {
  if (to.params["id"] !== from.params["id"]) {
    projectId.value = +to.params["id"]!;
    projectDetail.value = await API.projectInfo({ pid: projectId.value });
  }
});
watch(projectDetail, async (projectDetail) => {
  if (projectDetail?.status === "SubmitRejected") {
    showErrorDialog.value = true;
  }
  const file = (await API.listPendingFiles({ pid: projectId.value }))
    .pre_submit_file;
  firstReviewFile.value = file
    ? [{ id: file.id, name: file.name, selected: false }]
    : [];
});

const readOnly = ref(false);
const showErrorDialog = ref(false);
const showSubmitSuccess = ref(false);

const file = ref<File.FileUpload>({ status: File.UploadStatus.Unselected });
const firstReviewFile = ref<File.FileList>([]);
const uploadedFiles = ref<File.FileList>([]);

const comment = ref("");
const commentError = ref<string>();
watch(comment, () => (commentError.value = undefined));

const submitButtonLoading = ref(false);

const onUploadSuccess = async (id: number) => {
  const f = file.value.file!;
  const type = await f.getType();

  uploadedFiles.value.push({
    id: id,
    name: f.name,
    type: type?.mime,
    selected: true,
  });
  file.value = { status: File.UploadStatus.Unselected };
};

const onClear = (file: File.FileUpload) => {
  if (file.status === File.UploadStatus.Success)
    void API.deleteFile({ file_id: file.id! });
};

const onDelete = (file: File.FileListItem) =>
  API.deleteFile({ file_id: file.id });

const cancel = async () => {
  if (file.value.status === File.UploadStatus.Success)
    await API.deleteFile({ file_id: file.value.id! });
  router.back();
};

const submit = async () => {
  try {
    readOnly.value = true;
    switch (file.value.status) {
      case File.UploadStatus.Initialization:
      case File.UploadStatus.Uploading:
        throw new Error("请等待文件上传完成");
      case File.UploadStatus.Success:
        break;
      case File.UploadStatus.Error:
        throw new Error("文件上传失败,请重试");
    }

    submitButtonLoading.value = true;

    // check file status
    const usedFiles = uploadedFiles.value
      .filter((f) => f.selected)
      .map((f) => f.id);
    await cleanUnusedFiles(usedFiles, projectId.value);
    uploadedFiles.value = uploadedFiles.value.filter((f) => f.selected);
    const { files } = await API.listPendingFiles({
      pid: projectId.value,
    });
    if (
      files.length !== usedFiles.length ||
      files.some((f) => !usedFiles.includes(f.id))
    )
      throw new Error("本地文件与服务端不一致, 请重试");

    const res = await API.submit({
      pid: projectId.value,
      comment: comment.value,
      include_pre_submit_file: Boolean(firstReviewFile.value[0]?.selected),
    });
    if (res === "InvalidComment") {
      commentError.value = "备注内容不符合标准";
      throw new Error("备注内容不符合标准");
    }
  } catch (err) {
    if (err instanceof Error) {
      void platform.showToast({ title: err.message });
    }
    return;
  } finally {
    readOnly.value = false;
    submitButtonLoading.value = false;
  }
  showSubmitSuccess.value = true;
};
</script>

<style lang="scss">
.formal-submit-header {
  height: 100px;
  width: 100vw;
  margin-bottom: 10px;
  padding: 0 3vw;
  background-color: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .text {
    font-size: 35px;
    &.recruit {
      color: var(--text-color-secondary);
    }
    &.project-name {
      color: var(--theme-color-reverse);
    }
    &.formal-submit {
      font-size: 38px;
      color: var(--text-color-primary);
    }
  }
  .icon-arrow-right {
    margin: 0 5px;
    color: var(--text-color-secondary);
  }
}
.formal-submit-form {
  padding: 5px;

  .file-uploader {
    margin-top: 30px;
  }
}
.action-buttons-container {
  width: 100%;
  padding: 20px 0;
  position: fixed;
  left: 0;
  bottom: 90px;
  display: flex;
  align-items: center;
  background-color: (var(--background-color));

  .button {
    margin: 0 30px;

    &.cancel {
      flex: 1;
    }
    &.submit {
      flex: 2;
    }
  }
}
.action-buttons-placeholder {
  height: 240px;
}
.error-dialog {
  font-size: 32px;
  color: var(--text-color-primary);
}
</style>
