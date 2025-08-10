import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const id = ref("");
  const isLoggedIn = computed(() => !!id.value);
  return { id, isLoggedIn };
});
