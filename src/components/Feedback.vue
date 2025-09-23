<template>
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="feedback-content"
    round
    @click-overlay="show = false"
  >
    <img class="qrcode" :src="config.feedback.groupQRCode" />
    <a
      class="group-number"
      @click="platform.setClipboard(config.feedback.groupID)"
    >
      {{ config.feedback.groupID }}
      <span class="copy-button">
        <Noci name="copy" />
      </span>
    </a>
  </nut-popup>
</template>

<script setup lang="ts">
import { useConfig } from "@/composables/config";
import Noci from "@/components/Noci.vue";
import { platform } from "@/platforms";

const show = defineModel<boolean>({ required: true });

const config = useConfig();
</script>

<style lang="scss">
.feedback-content {
  padding: 5%;
  text-align: center;

  .qrcode {
    width: 500px;
    border-radius: 20px;
  }
  .group-number {
    color: var(--text-color-primary);
    cursor: pointer;
  }
  .copy-button {
    display: inline;
    margin-left: 5px;
    color: var(--text-color-secondary);
    vertical-align: middle;
  }
}
</style>
