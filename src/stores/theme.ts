import { platform } from "@/platforms";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type Theme = "auto" | "light" | "dark";

export const useThemeStore = defineStore(
  "theme",
  () => {
    const _systemTheme = ref(platform.getSystemTheme());
    platform.onSystemThemeChange((theme) => {
      _systemTheme.value = theme;
    });
    const theme = ref<Theme>("auto");
    const currentTheme = computed(() =>
      theme.value === "auto" ? _systemTheme.value : theme.value,
    );
    return { theme, currentTheme };
  },
  { persist: true },
);
