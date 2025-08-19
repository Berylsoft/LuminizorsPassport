<template>
  <view>
    <view class="project-list">
      <nut-backtop :bottom="400" :distance="500">
        <template #content>
          <template v-if="loaded">
            <nut-cell
              v-for="project in projects"
              :key="project.id"
              center
              class="project-cell"
              is-link
              :round-radius="20"
              size="large"
              @click="
                () =>
                  router.push({
                    name: 'project-overview',
                    params: { id: project.id },
                  })
              "
            >
              <template #title>
                <span class="project-name">{{ project.name }}</span>
              </template>
              <template #desc>
                <span class="joined-status">
                  <Icon
                    class="icon"
                    :color="project.joined ? 'green' : 'grey'"
                    :name="project.joined ? 'checkmark-circle' : 'add-circle'"
                    :size="20"
                  />
                  {{ project.joined ? "已加入" : "可参加" }}
                </span>
              </template>
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
              <nut-skeleton
                width="80vh"
                height="1.5vh"
                animated
                row="3"
                round
              />
            </nut-cell>
          </template>
        </template>
      </nut-backtop>
    </view>
  </view>
</template>

<script lang="ts" setup>
import Icon from "@/components/Icon.vue";
import { useAPI } from "@/composables/api";
import { Project } from "@/types";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const API = useAPI();
const router = useRouter();

const projects = ref<Project.ProjectInfo[]>([]);
const loaded = ref(false);
onMounted(async () => {
  try {
    projects.value = (await API.listProjects()).projects;
  } finally {
    loaded.value = true;
  }
});
</script>

<style lang="scss">
.project-cell {
  min-height: 250px;

  .project-name {
    margin: 10%;
    vertical-align: middle;
    color: var(--text-color-primary);
    font-size: 40px;
  }
  .icon {
    vertical-align: middle;
  }
  .joined-status {
    vertical-align: middle;
    color: var(--text-color-secondary);
    font-size: 32px;
  }
}
</style>
