import { defineStore } from "pinia";
import { ref } from "vue";

export type AttachmentInfo = {
  path: string;
  size: number;
};

export const useAttachmentStore = defineStore(
  "attachment",
  () => {
    const localAttachments = ref<Record<number, AttachmentInfo>>({});
    return { localAttachments };
  },
  {
    persist: true,
  },
);
