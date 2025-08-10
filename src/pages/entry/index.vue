<template>
  <a></a>
  <view :class="['main', `theme-${themeStore.getCurrentTheme}`]">
    <nut-config-provider :theme="themeStore.getCurrentTheme">
      <view class="content">
        <router-view></router-view>
      </view>
      <view class="tabbar">
        <nut-tabbar
          v-model="activatedTab"
          bottom
          safe-area-inset-bottom
          placeholder
          @tab-switch="tabSwitch"
        >
          <nut-tabbar-item
            v-for="({ title, icon }, name) in navList"
            :key="name"
            :tab-title="title"
            :name
          >
            <template #icon>
              <Icon :name="icon" :size="28" />
            </template>
          </nut-tabbar-item>
        </nut-tabbar>
      </view>
      <Login />
      <Toast />
    </nut-config-provider>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Login from "@/components/Login.vue";
import Icon from "@/components/Icon.vue";
import Toast from "@/components/Toast.vue";
import { useConfig } from "@/composables/config";
import { platform } from "@/platforms";
import { useThemeStore } from "@/stores/theme";

const config = useConfig();
const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

watch(
  () => themeStore.getCurrentTheme,
  async (newTheme) => {
    await Taro.setBackgroundColor({
      backgroundColor: newTheme === "dark" ? "#333" : "#fff",
    });
    await Taro.setBackgroundTextStyle({ textStyle: newTheme });
  },
);
const navList = {
  home: { path: "/", title: "首页", icon: "home" },
  recruit: { path: "/recruit/", title: "征集", icon: "receipt" },
  my: { path: "/user/", title: "我的", icon: "person-circle" },
};
type NavItem = keyof typeof navList;
const activatedTab = ref<NavItem | "">("");
const tabSwitch = (item: { name: NavItem }) => router.push(navList[item.name]);

const setTitleAndActivatedTab = async (_path: string) => {
  activatedTab.value =
    (Object.entries(navList)
      .sort((a, b) => a[1].path.length - b[1].path.length)
      .findLast(([, { path }]) => _path.startsWith(path))?.[0] as
      | NavItem
      | undefined) ?? "";
  await platform.setTitle(
    activatedTab.value === ""
      ? config.name
      : `${navList[activatedTab.value].title} | ${config.name}`,
  );
};
router.afterEach(({ path }) => setTitleAndActivatedTab(path));

onMounted(() => setTitleAndActivatedTab(route.path));
</script>

<style lang="scss">
.main {
  width: 100%;
  height: 100%;
}

.content {
  padding: 15px;
}
</style>
