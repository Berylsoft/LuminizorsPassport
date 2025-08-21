<template>
  <view>
    <view class="project-list">
      <nut-backtop :bottom="200" :distance="300">
        <template #content>
          <template v-if="loaded">
            <nut-cell
              v-for="project in projects"
              :key="project.id"
              center
              class="project-cell"
              :is-link="project.joined"
              :round-radius="20"
              size="large"
              @click="
                () =>
                  project.joined &&
                  router.push({
                    name: 'project-overview',
                    params: { id: project.id },
                  })
              "
            >
              <nut-space direction="vertical" fill :gutter="15">
                <view class="banner">
                  <img class="banner-image" :src="img1" :alt="project.name" />
                </view>
                <view class="project-info">
                  <view>
                    <view class="project-name">
                      {{ project.name }}
                    </view>
                    <view class="project-status">
                      <span v-if="project.ended" class="status-ended"
                        >已结束</span
                      >
                      <span v-else class="status-in-progress">进行中</span>
                    </view>
                  </view>
                  <view class="action">
                    <template v-if="project.joined">
                      <span class="action-text">查看详情</span>
                      <Icon
                        class="action-icon"
                        color="var(--text-color-secondary)"
                        name="chevron-right"
                        size="24"
                      />
                    </template>
                    <template v-else-if="!project.ended">
                      <nut-button
                        class="action-button"
                        type="primary"
                        size="small"
                        @click="() => joinProject(project.id, project.name)"
                      >
                        报名
                      </nut-button>
                    </template>
                  </view>
                </view>
              </nut-space>
            </nut-cell>
          </template>
          <template v-else>
            <nut-cell
              v-for="i in 6"
              :key="i"
              center
              class="project-cell"
              :round-radius="20"
              size="large"
            >
              <nut-space direction="vertical" fill :gutter="15">
                <nut-skeleton
                  width="80vw"
                  height="2vh"
                  animated
                  round
                  row="3"
                  :title="false"
                />
                <nut-skeleton
                  width="80vw"
                  height="2vh"
                  animated
                  round
                  row="0"
                />
              </nut-space>
            </nut-cell>
          </template>
        </template>
      </nut-backtop>
    </view>
    <view>
      <JoinProject
        v-model="showJoinProject"
        :project-id="projectToJoin"
        :project-name="projectNameToJoin"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import img1 from "@/assets/image/2025.jpg";
import Icon from "@/components/Icon.vue";
import JoinProject from "@/components/JoinProject.vue";
import { useAPI } from "@/composables/api";
import { Project } from "@/types";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const API = useAPI();
const router = useRouter();

const showJoinProject = ref(false);
const projectToJoin = ref<number | undefined>();
const projectNameToJoin = ref("");

const projects = ref<Project.ProjectInfo[]>([
  { id: 1, name: "Test Project", joined: true, ended: false },
  { id: 2, name: "Test Project2", joined: true, ended: true },
  { id: 3, name: "Test Project3", joined: false, ended: false },
  { id: 4, name: "Test Project4", joined: false, ended: true },
]);
const loaded = ref(true);
onMounted(async () => {
  try {
    projects.value = (await API.listProjects()).projects;
  } finally {
    loaded.value = true;
  }
});

const joinProject = (id: number, name: string) => {
  projectToJoin.value = id;
  projectNameToJoin.value = name;
  showJoinProject.value = true;
};
</script>

<style lang="scss">
.project-cell {
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
    .project-status {
      font-size: 26px;

      .status-ended {
        color: var(--text-color-secondary);
      }
      .status-in-progress {
        color: orange;
      }
    }
    .action {
      .action-text {
        font-size: 32px;
        color: var(--theme-color-reverse);
      }
      .action-icon {
        vertical-align: middle;
      }
      .action-button {
        margin: 0 20px;
      }
    }
  }
}
</style>
