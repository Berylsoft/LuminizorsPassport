<template>
  <view class="main-content" :class="`theme-${themeStore.currentTheme}`">
    <nut-config-provider :theme="themeStore.currentTheme">
      <view class="body">
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
              <Noci :name="icon" :size="50" />
            </template>
          </nut-tabbar-item>
        </nut-tabbar>
      </view>
      <Login />
      <Toast />
    </nut-config-provider>
    <a></a>
  </view>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Login from "@/components/Login.vue";
import Noci from "@/components/Noci.vue";
import Toast from "@/components/Toast.vue";
import { useConfig } from "@/composables/config";
import { platform } from "@/platforms";
import { useThemeStore } from "@/stores/theme";

const config = useConfig();
const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

watch(
  () => themeStore.currentTheme,
  (newTheme) => {
    Taro.nextTick(() => {
      void Taro.setBackgroundColor({
        backgroundColor: newTheme === "dark" ? "#333" : "#fff",
      });
      void Taro.setBackgroundTextStyle({ textStyle: newTheme });
      void Taro.setNavigationBarColor({
        frontColor: newTheme === "dark" ? "#ffffff" : "#000000",
        backgroundColor: newTheme === "dark" ? "#000000" : "#ffffff",
      });
    });
  },
  { immediate: true },
);
const navList = {
  home: { target: "home", title: "首页", icon: "home" },
  recruit: { target: "recruit", title: "征集", icon: "receipt" },
  my: { target: "user", title: "我的", icon: "person-circle" },
};
type NavItem = keyof typeof navList;
const activatedTab = ref<NavItem | "">("");
const tabSwitch = (item: { name: NavItem }) =>
  router.push({ name: navList[item.name].target });

const setTitleAndActivatedTab = async (_path: string) => {
  activatedTab.value =
    (Object.entries(navList)
      .sort((a, b) => b[1].target.length - a[1].target.length)
      .find(([, { target }]) => _path.startsWith(`/${target}`))?.[0] as
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
.main-content {
  height: 100vh;
  width: 100vw;
  background-color: var(--background-color);
  --nut-primary-color: var(--theme-color);
  --nut-primary-color-end: var(--theme-color-dark);
  --nut-dark-color: var(--text-color-primary);
}

.body {
  height: 100%;
  padding: 15px;
  background-color: var(--background-color);
}
</style>
