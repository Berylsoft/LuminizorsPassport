<template>
  <view>
    <view class="project-list">
      <nut-backtop>
        <template #content>
          <nut-cell
            v-for="project in projects"
            :key="project.id"
            center
            class="project-cell"
            is-link
            :round-radius="20"
            size="large"
            @click="() => router.push({ path: `/recruit/${project.id}` })"
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
                {{ project.joined ? "已加入" : "未加入" }}
              </span>
            </template>
          </nut-cell>
        </template>
      </nut-backtop>
    </view>
  </view>
</template>

<script lang="ts" setup>
import Icon from "@/components/Icon.vue";
import { ListProjects, useAPI } from "@/composables/api";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const API = useAPI();
const router = useRouter();

const projects = ref<ListProjects.ProjectInfo[]>([]);
onMounted(async () => {
  projects.value = (await API.listProjects()).projects;
});
</script>

<style lang="scss">
.project-cell {
  min-height: 200px;

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
