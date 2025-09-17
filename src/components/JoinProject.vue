<template>
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="join-project-content"
    round
    @click-overlay="show = false"
  >
    <view v-if="joined" class="success">
      <view class="success-icon">
        <Icon name="checkmark-circle" size="25vw" />
      </view>
      <view class="success-text">欢迎加入{{ projectName }}</view>
      <view class="redirect-tips">即将跳转到项目详情页</view>
    </view>
    <view v-else class="join-form">
      <template v-if="question">
        <view class="title">加入{{ projectName }}</view>
        <view class="question">{{ question }}</view>
        <view class="answer">
          <nut-input
            v-model.lazy.trim="answer"
            class="answer-input"
            clearable
            :error
            placeholder="请输入答案"
          />
        </view>
      </template>
      <nut-skeleton v-else width="70vw" height="2vh" animated round row="2" />
      <view class="buttons">
        <nut-button
          class="cancel-button"
          autofocus
          type="default"
          @click="show = false"
        >
          取消
        </nut-button>
        <nut-button
          class="confirm-button"
          :disabled="!question || !answer"
          :loading="joining"
          type="primary"
          @click="join"
        >
          加入
        </nut-button>
      </view>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import Icon from "@/components/Icon.vue";
import { useAPI } from "@/composables/api";
import { sleep } from "@/utils/";

const show = defineModel<boolean>();
const props = defineProps<{
  projectId?: number | undefined;
  projectName: string;
}>();

const API = useAPI();
const router = useRouter();

const question = ref(
  props.projectId === undefined
    ? undefined
    : (await API.joinProjectStart({ Start: { pid: props.projectId } })).Start
        .question,
);
watch(
  () => props.projectId,
  async (id) => {
    question.value =
      id === undefined
        ? ""
        : (await API.joinProjectStart({ Start: { pid: id } })).Start.question;
  },
);

const answer = ref("");
const error = ref(false);
const joining = ref(false);
const joined = ref(false);

watch(answer, () => (error.value = false));

const join = async () => {
  joining.value = true;
  try {
    await API.joinProject({
      Join: {
        pid: props.projectId!,
        answer: answer.value,
      },
    });
    joined.value = true;
    await sleep(3000);
    await router.push({
      name: "project-overview",
      params: { id: props.projectId },
    });
  } catch {
    error.value = true;
    return;
  } finally {
    joining.value = false;
  }
};
</script>

<style lang="scss">
.join-project-content {
  padding: 5%;
  text-align: center;
  width: 80vw;
  min-height: 25vh;

  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 25vh;

    .success-icon {
      color: var(--theme-color);
    }
    .success-text {
      color: var(--text-color-primary);
      font-size: 40px;
    }
    .redirect-tips {
      color: var(--text-color-secondary);
      font-size: 32px;
    }
  }
  .join-form {
    .title {
      margin-bottom: 40px;
      color: var(--text-color-primary);
      font-weight: bold;
    }
    .question {
      margin-bottom: 10px;
      color: var(--text-color-secondary);
      font-size: 32px;
      white-space: pre-wrap;
    }
    .buttons {
      display: flex;
      margin-top: 40px;
      justify-content: space-around;
      --nut-button-default-padding: 0 60px;
    }
  }
}
</style>
