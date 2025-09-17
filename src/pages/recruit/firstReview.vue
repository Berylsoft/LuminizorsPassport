<template>
  <nut-sticky>
    <view class="first-review-header">
      <view class="text recruit">征集</view>
      <Icon
        class="icon-arrow-right"
        name="chevron-right"
        color="var(--text-color-secondary)"
        :size="25"
      />
      <router-link
        class="text project-name"
        :to="{ name: 'project-overview', params: { id: projectId } }"
        >{{ projectDetail?.info.name }}</router-link
      >
      <Icon class="icon-arrow-right" name="chevron-right" :size="25" />
      <view class="text first-review">提交初审</view>
    </view>
  </nut-sticky>
  <view class="first-review-form">
    <nut-space direction="vertical" fill :gutter="10">
      <nut-cell size="large" :round-radius="20">
        <FormItem
          title="请输入用户名"
          description="填写的称呼会出现在答谢名单等处, 请谨慎填写\n如果我们认为不合适, 将无法通过审核\n不要出现装饰符号、特殊符号"
          :error="usernameError"
        >
          <template #description>
            填写的称呼会出现在答谢名单等处, 请谨慎填写<br />
            如果我们认为不合适, 将无法通过审核<br />
            不要出现装饰符号及特殊符号
          </template>
          <nut-input
            v-model.trim="username"
            autofocus
            clearable
            :error="Boolean(usernameError)"
            max-length="20"
            placeholder="请输入用户名"
            show-word-limit
            type="text"
          />
        </FormItem>
      </nut-cell>
      <nut-cell size="large" :round-radius="20">
        <FormItem title="上传音频">
          <template v-if="!skipPassword" #description>
            <view class="skip-code">
              拥有跳过密码?
              <span class="clickable" @click="showSkipInterface = true">
                点击填写
              </span>
            </view>
            支持格式: {{ config.upload.acceptedExtensions.join(", ") }}
          </template>
          <template v-else #description>
            <view class="skip-code">
              已填写跳过密码
              <span class="clickable" @click="skipPassword = ''">取消</span>
            </view>
          </template>
          <file-uploader
            v-if="!skipPassword"
            v-model="file"
            class="file-uploader"
            :file-size-min="projectDetail?.info.pre_submit_file_size_min"
            :file-size-max="projectDetail?.info.pre_submit_file_size_max"
            :project-id
          />
        </FormItem>
      </nut-cell>
      <nut-cell
        v-if="showHarmonyGroupIntention"
        size="large"
        :round-radius="20"
      >
        <FormItem title="和声组">
          <template #description>
            相对于基本要求, 和声对唱功和理解要求都稍高<br />
            如果认为自己有能力(如有合唱团经验等)或者可以试试,
            可在下方填写意向<br />
            我们会参考你的试音情况综合判断
          </template>
          <nut-checkbox v-model="harmonyGroupIntention" :icon-size="16">
            我有意愿加入和声组
          </nut-checkbox>
        </FormItem>
      </nut-cell>
      <nut-cell size="large" :round-radius="20">
        <FormItem title="备注" :error="commentError">
          <nut-textarea
            v-model.trim="comment"
            clearable
            limit-show
            max-length="100"
            placeholder="请输入备注(选填)"
          />
        </FormItem>
      </nut-cell>
    </nut-space>
    <view class="action-buttons-placeholder"></view>
  </view>
  <view class="action-buttons-container">
    <nut-button
      class="button cancel"
      size="large"
      type="default"
      @click="cancel"
    >
      取消
    </nut-button>
    <nut-button
      class="button submit"
      :disabled="submitButtonDisabled"
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
      is-first-review
    />
    <nut-popup
      v-model:visible="showSkipInterface"
      pop-class="skipping-interface"
      round
      @click-overlay="hideSkipInterface"
    >
      <FormItem
        title="跳过初审"
        description="被邀请的用户可在下方填写密码, 直接跳过初审音频提交"
        :error="skipPasswordInputError"
      >
        <nut-input
          v-model.trim="skipPasswordInput"
          autofocus
          clearable
          max-length="20"
          placeholder="请输入跳过密码"
          show-word-limit
        />
      </FormItem>
      <view class="buttons">
        <nut-button type="default" @click="hideSkipInterface">
          取消
        </nut-button>
        <nut-button
          :disabled="Boolean(skipPasswordInputError)"
          type="primary"
          @click="saveSkipPassword"
        >
          确定
        </nut-button>
      </view>
    </nut-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import FileUploader from "@/components/FileUploader.vue";
import Icon from "@/components/Icon.vue";
import FormItem from "@/components/FormItem.vue";
import { useAPI } from "@/composables/api";
import { useConfig } from "@/composables/config";
import { File, Project } from "@/types";
import { platform } from "@/platforms";
import SubmitSuccess from "@/components/SubmitSuccess.vue";

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

const showSubmitSuccess = ref(false);
const showSkipInterface = ref(false);

const username = ref("");
const usernameError = ref<string>();
watch(username, (name) => {
  if (name.length === 0) usernameError.value = "用户名不能为空";
  else usernameError.value = undefined;
});

const skipPassword = ref("");
const skipPasswordInput = ref("");
const skipPasswordInputError = ref<string>();
watch(skipPasswordInput, (code) => {
  if (code.length === 0) skipPasswordInputError.value = "密码不能为空";
  else skipPasswordInputError.value = undefined;
});

const showHarmonyGroupIntention = computed(
  () => projectDetail.value?.info.require_harmony_group_intention,
);
const harmonyGroupIntention = ref(false);

const file = ref<File.FileUpload>({ status: File.UploadStatus.Unselected });

const comment = ref("");
const commentError = ref<string>();
watch(comment, () => (commentError.value = undefined));

const submitButtonDisabled = computed(
  () => !username.value || (!skipPassword.value && !file.value),
);
const submitButtonLoading = ref(false);

const cancel = () => {
  router.back();
};
const submit = async () => {
  try {
    const error = usernameError.value ?? commentError.value;
    if (error) throw new Error(error);
    if (skipPassword.value !== "") {
      submitButtonLoading.value = true;
      const res = await API.preSubmitWithSkipPassword({
        pid: projectId.value,
        name: username.value,
        comment: comment.value,
        skip: skipPassword.value,
        ...(showHarmonyGroupIntention.value
          ? { harmony_group_intention: harmonyGroupIntention.value }
          : {}),
      });
      handleSubmitResponse(res);
    } else {
      switch (file.value.status) {
        case File.UploadStatus.Initialization:
        case File.UploadStatus.Uploading:
          throw new Error("请等待文件上传完成");
        case File.UploadStatus.Success:
          break;
        case File.UploadStatus.Error:
          throw new Error("文件上传失败,请重试");
        default:
          throw new Error("请先上传试音文件");
      }
      submitButtonLoading.value = true;
      const res = await API.preSubmit({
        pid: projectId.value,
        name: username.value,
        comment: comment.value,
        file: { File: file.value.id! },
        ...(showHarmonyGroupIntention.value
          ? { harmony_group_intention: harmonyGroupIntention.value }
          : {}),
      });
      handleSubmitResponse(res);
    }
  } catch (err) {
    if (err instanceof Error) {
      void platform.showToast({ title: err.message });
    }
    return;
  } finally {
    submitButtonLoading.value = false;
  }
  showSubmitSuccess.value = true;
};

const handleSubmitResponse = (
  result: "Success" | "InvalidName" | "InvalidComment" | "InvalidSkipPassword",
) => {
  switch (result) {
    case "Success":
      void platform.showToast({ title: "提交成功" });
      break;
    case "InvalidName":
      usernameError.value = "用户名不符合标准";
      throw new Error("用户名不符合标准");
    case "InvalidComment":
      commentError.value = "备注内容不符合标准";
      throw new Error("备注内容不符合标准");
    case "InvalidSkipPassword":
      skipPassword.value = "";
      throw new Error("跳过密码校验失败, 请重试");
  }
};

const hideSkipInterface = () => {
  skipPasswordInput.value = "";
  showSkipInterface.value = false;
};
const saveSkipPassword = () => {
  skipPassword.value = skipPasswordInput.value;

  showSkipInterface.value = false;
};
</script>

<style lang="scss">
.first-review-header {
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
    &.first-review {
      font-size: 38px;
      color: var(--text-color-primary);
    }
  }
  .icon-arrow-right {
    margin: 0 5px;
    color: var(--text-color-secondary);
  }
}
.first-review-form {
  padding: 5px;

  .skip-code {
    margin-bottom: 10px;
    font-size: 28px;
    color: var(--text-color-primary);
    font-weight: normal;

    .clickable {
      margin: 0 10px;
      color: var(--theme-color-reverse);
      cursor: pointer;
    }
  }
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
.skipping-interface {
  padding: 5%;
  text-align: center;
  width: 600px;

  .title {
    font-size: 36px;
  }
  .buttons {
    margin-top: 30px;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    --nut-button-default-padding: 0 70px;
  }
}
</style>
