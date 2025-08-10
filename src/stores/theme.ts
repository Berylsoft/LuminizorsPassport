import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type Theme = "auto" | "light" | "dark";

const getBrowserTheme = () => {
  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const theme = ref<"light" | "dark">(darkModeQuery.matches ? "dark" : "light");
  darkModeQuery.addEventListener("change", (e) => {
    theme.value = e.matches ? "dark" : "light";
  });
  return theme;
};

export const useThemeStore = defineStore(
  "theme",
  () => {
    const _browserTheme = getBrowserTheme();
    const theme = ref<Theme>("auto");
    const getCurrentTheme = computed(() =>
      theme.value === "auto" ? _browserTheme.value : theme.value
    );
    return { theme, getCurrentTheme };
  },
  { persist: true }
);
