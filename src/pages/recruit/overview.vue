<template>
  <nut-cell class="project-overview" size="large" :round-radius="20">
    <nut-space direction="vertical" fill :gutter="15">
      <view class="banner">
        <image class="banner-image" lazy-load :src="img1" />
      </view>
      <view class="project-info">
        <view>
          <view class="project-name">
            {{ projectDetail?.info.name }}
          </view>
          <view class="end-time">
            <span v-if="!isEnded">
              离结束还有<nut-countdown
                class="end-time-countdown"
                :end-time="endTime.valueOf()"
                format="DD天HH时"
                @on-end="isEnded = new Date() > endTime"
              />
            </span>
            <span v-else>已结束</span>
          </view>
        </view>
        <view class="project-status">
          <span class="status-text" :style="{ color: statusColor }">
            {{ statusText }}
          </span>
          <span @click="refresh">
            <Noci
              :animate="refreshing ? 'rotate' : undefined"
              class="refresh-button"
              name="arrow-clockwise"
              :size="48"
            />
          </span>
        </view>
      </view>
    </nut-space>
  </nut-cell>
  <nut-cell
    v-if="detailCell.show"
    class="detail-info"
    :round-radius="20"
    size="large"
  >
    <view class="title">
      <Noci class="icon" :name="detailCell.icon" />{{ detailCell.title }}
    </view>
    <view class="content">
      <template v-if="projectDetail?.status === 'PreSubmitPassed'">
        您通过了初审, 分配到
        <nut-tag
          v-for="group in groups"
          :key="group"
          class="group-tag"
          :color="groupMapping[group].color"
          round
          >{{ groupMapping[group].text }}组</nut-tag
        >
      </template>
      <template v-else-if="projectDetail?.status === 'PreSubmitRejected'">
        很遗憾, 您未能通过审核, 原因如下:
        <view class="reason">{{
          getReasonText(projectDetail.pre_submit_detail.Rejected.reason)
        }}</view>
      </template>
      <template v-else-if="projectDetail?.status === 'SubmitPassed'">
        您已完成所有步骤, 恭喜您成为<nut-tag
          v-for="group in groups"
          :key="group"
          class="group-tag"
          :color="groupMapping[group].color"
          round
          >{{ groupMapping[group].text }}组</nut-tag
        >成员
      </template>
      <template v-else-if="projectDetail?.status === 'SubmitRejected'">
        很遗憾, 您未能通过审核, 原因如下:
        <view class="reason">{{
          getReasonText(projectDetail.submit_detail.Rejected.reason)
        }}</view>
      </template>
    </view>
  </nut-cell>
  <view class="join-steps">
    <nut-steps direction="vertical" progress-dot :current="currentStep">
      <nut-step title="报名" content="报名成功">1</nut-step>
      <nut-step title="初审" :content="firstReviewStatus">2</nut-step>
      <nut-step title="签署NDA" :content="NDAStatus"> 3 </nut-step>
      <nut-step title="正式提交" :content="formalSubmitStatus">4</nut-step>
      <nut-step title="完成">5</nut-step>
    </nut-steps>
  </view>
  <view class="action-button-container">
    <nut-button
      v-if="showAttachmentButton"
      class="button attachment"
      :loading="attachmentButton.loading"
      size="large"
      type="default"
      @click="() => attachmentButton.action()"
    >
      {{ attachmentButton.text }}
    </nut-button>
    <nut-button
      class="button main"
      :disabled="mainButton.disabled"
      size="large"
      type="primary"
      @click="mainButton.action"
    >
      {{ mainButton.text }}
    </nut-button>
  </view>
  <view>
    <NDA
      v-model="showNDA"
      :project="projectDetail"
      :project-id="projectId"
      @on-success="refresh"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import img1 from "@/assets/image/2025.jpg";
import Noci from "@/components/Noci.vue";
import NDA from "@/components/NDA.vue";
import { useAPI } from "@/composables/api";
import { type AttachmentStatus, useAttachment } from "@/composables/attachment";
import type { Project, Review } from "@/types";

const attachment = useAttachment();
const API = useAPI();
const route = useRoute();
const router = useRouter();

const showNDA = ref(false);

const projectId = ref(+route.params["id"]!);
const projectDetail = ref<Project.ProjectDetail>();
const updateProjectDetail = async () => {
  projectDetail.value = await API.projectInfo({ pid: projectId.value });
  attachmentDownloadStatus.value = await attachment.getAttachmentStatus(
    projectId.value,
  );
};
onBeforeRouteUpdate(async (to, from) => {
  if (to.params["id"] !== from.params["id"]) {
    projectId.value = +to.params["id"]!;
    await updateProjectDetail();
  }
});

const endTime = computed(() =>
  projectDetail.value
    ? new Date(projectDetail.value.info.end_time)
    : new Date(),
);
const isEnded = ref(new Date() > endTime.value);

const refreshing = ref(false);
const refresh = async () => {
  try {
    refreshing.value = true;
    projectDetail.value = await API.projectInfo({ pid: projectId.value });
  } finally {
    refreshing.value = false;
  }
};

const groups = computed(() => {
  const detail = projectDetail.value?.pre_submit_detail ?? {};
  const groupInfo =
    "Passed" in detail ? (detail.Passed as Review.GroupInfo) : undefined;
  if (groupInfo) {
    return Object.entries(groupInfo)
      .filter(([, value]) => value)
      .map(([key]) => key as keyof Review.GroupInfo);
  } else {
    return [];
  }
});
const groupMapping: Record<
  keyof Review.GroupInfo,
  { text: string; color: string }
> = {
  lead: { text: "领唱", color: "red" },
  choir: { text: "合唱", color: "darkblue" },
  choir_harmony: { text: "合唱和声", color: "darkgreen" },
  harmony: { text: "和声", color: "darkcyan" },
};
const openFirstReview = () =>
  void router.push({
    name: "first-review",
    query: {
      pid: projectId.value,
    },
  });
const openFormalSubmit = () =>
  void router.push({
    name: "formal-submit",
    query: {
      pid: projectId.value,
    },
  });

const getReasonText = (
  reason: Review.FirstReview.RejectReason | Review.FormalSubmit.RejectReason,
) => {
  switch (reason) {
    case "DeviceOrEnvironment":
      return "录制设备或环境不过关";
    case "RequirementNotMet":
      return "不符合标准";
    case "InvalidName":
      return "名字不合适";
    case "Other":
      return projectDetail.value?.submit_detail?.Rejected.detail ?? "其他原因";
  }
};

const firstReviewStatus = computed(() => {
  switch (projectDetail.value?.status) {
    case "Entered":
      return "待提交";
    case "PreSubmitted":
      return "已提交, 审核中";
    case "PreSubmitRejected":
      return `初审未通过, ${getReasonText(projectDetail.value.pre_submit_detail.Rejected.reason)}`;
    default:
      return "初审通过";
  }
});
const NDAStatus = computed(() => {
  switch (projectDetail.value?.nda_info) {
    case null:
      return "未签署半保密协议";
    case "Agreed":
      return "已签署半保密协议";
    case "NoNda":
      return "此项目暂无NDA";
    default:
      return "待签署半保密协议";
  }
});
const formalSubmitStatus = computed(() => {
  switch (projectDetail.value?.status) {
    case "SubmitPassed":
      return "正式提交已通过";
    case "SubmitRejected":
      return `正式提交未通过, ${getReasonText(projectDetail.value.submit_detail.Rejected.reason)}`;
    default:
      return "待提交";
  }
});

const statusText = ref("");
const statusColor = ref("");
const detailCell = ref({
  show: false,
  icon: "",
  title: "",
});
const mainButton = ref<{
  text: string;
  disabled: boolean;
  action?: () => void;
}>({ text: "", disabled: false, action: () => {} });
const currentStep = ref(1);

watch(
  () => projectDetail.value?.status,
  () => {
    switch (projectDetail.value?.status) {
      case "Entered":
        statusText.value = "已报名";
        statusColor.value = "darkgrey";
        detailCell.value.show = false;
        mainButton.value = {
          text: "上传初审信息",
          disabled: false,
          action: openFirstReview,
        };
        currentStep.value = 2;
        break;

      case "PreSubmitted":
        statusText.value = "初审审核中";
        statusColor.value = "var(--theme-color-dark)";
        detailCell.value.show = false;
        mainButton.value = {
          text: "请耐心等待初审结果",
          disabled: true,
        };
        currentStep.value = 2;
        break;

      case "PreSubmitRejected":
        statusText.value = "初审未通过";
        statusColor.value = "red";
        detailCell.value = {
          show: true,
          icon: "warning",
          title: "初审未通过",
        };
        mainButton.value = {
          text: "重新上传初审信息",
          action: openFirstReview,
          disabled: false,
        };
        currentStep.value = 2;
        break;

      case "PreSubmitPassed":
        if (
          typeof projectDetail.value.nda_info === "object" &&
          "Pending" in projectDetail.value.nda_info
        ) {
          statusText.value = "待签署NDA";
          statusColor.value = "orange";
          mainButton.value = {
            text: "查看半保密协议",
            disabled: false,
            action: () => (showNDA.value = true),
          };
          currentStep.value = 3;
        } else {
          statusText.value = "初审通过";
          statusColor.value = "green";
          mainButton.value = {
            text: "去正式提交",
            disabled: false,
            action: openFormalSubmit,
          };
          currentStep.value = 4;
        }
        detailCell.value = {
          show: true,
          icon: "info",
          title: "初审已通过",
        };
        break;

      case "Submitted":
        statusText.value = "正式提交审核中";
        statusColor.value = "var(--theme-color-dark)";
        detailCell.value.show = false;
        mainButton.value = {
          text: "请耐心等待审核结果",
          disabled: true,
        };
        currentStep.value = 4;
        break;

      case "SubmitRejected":
        statusText.value = "正式提交未通过";
        statusColor.value = "red";
        detailCell.value = {
          show: true,
          icon: "warning",
          title: "正式提交未通过",
        };
        mainButton.value = {
          text: "重新提交",
          disabled: false,
          action: openFormalSubmit,
        };
        currentStep.value = 4;
        break;

      case "SubmitPassed": {
        statusText.value = "正式提交已通过";
        statusColor.value = "green";
        detailCell.value = {
          show: true,
          icon: "info",
          title: "正式提交已通过",
        };
        mainButton.value = {
          text: "已完成所有流程",
          disabled: true,
        };
        currentStep.value = 5;
        break;
      }
    }
  },
  { immediate: true },
);

const showAttachmentButton = computed(
  () => projectDetail.value?.have_attachment,
);
const attachmentButton = ref<{
  text: string;
  loading: boolean;
  action: () => void;
}>({
  text: "下载附件",
  loading: false,
  action: () => void downloadAttachment(),
});
const attachmentDownloadStatus = ref<AttachmentStatus>("unstart");
const downloadAttachment = async () => {
  const abort = new AbortController();
  attachmentButton.value = {
    text: "下载中",
    loading: true,
    action: () => {
      abort.abort();
    },
  };
  try {
    const { open } = await attachment.downloadAttachment(
      projectId.value,
      abort.signal,
      (progress) => {
        attachmentButton.value.text = `下载中 (${Math.round(progress * 100).toString()}%)`;
      },
    );
    attachmentButton.value = { text: "打开附件", loading: false, action: open };
  } catch {
    attachmentButton.value = {
      text: "下载附件",
      loading: false,
      action: () => void downloadAttachment(),
    };
  }
};
</script>

<style lang="scss">
.project-overview {
  height: max-content;

  .banner {
    display: flex;
    justify-content: center;
    align-items: center;

    .banner-image {
      width: 100%;
      height: auto;
      border-radius: 20px;
    }
  }
  .project-info {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;

    .project-name {
      font-size: 36px;
      font-weight: bold;
      color: var(--text-color-primary);
    }
    .end-time {
      font-size: 26px;
      color: var(--text-color-secondary);

      .nut-countdown {
        display: inline;
        font-size: 26px;
        color: var(--text-color-secondary);
      }
    }
    .project-status {
      padding: 0 20px;

      .status-text {
        font-size: 32px;
        vertical-align: middle;
      }
      .refresh-button {
        margin: 0 15px;
        vertical-align: middle;
        color: var(--text-color-secondary);
        cursor: pointer;
        --animate-delay: 0s;
      }
    }
  }
}

.detail-info {
  display: block;

  .title {
    color: var(--theme-color-dark);
    font-size: 32px;
    margin-bottom: 20px;

    .icon {
      margin-right: 10px;
      vertical-align: middle;
    }
  }
  .content {
    .group-tag {
      margin: 0 5px;
    }
    .reason {
      color: var(--text-color-secondary);
      font-weight: bold;
    }
  }
}

.join-steps {
  margin: 40px;
  --nut-steps-base-title-font-size: 36px;
  --nut-steps-base-title-color: var(--text-color-primary);
  --nut-steps-base-content-font-size: 26px;
  --nut-steps-base-content-color: var(--text-color-secondary);
  --nut-steps-base-title-margin-bottom: 5px;

  .nut-step-content {
    margin-bottom: 20px;
  }
}

.action-button-container {
  position: fixed;
  left: 0;
  bottom: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .button {
    margin: 0 30px;

    &.attachment {
      flex: 1;
    }
    &.main {
      flex: 2;
    }
  }
}
</style>
