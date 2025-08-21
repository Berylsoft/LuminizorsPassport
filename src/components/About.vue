<template class="about">
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="about-content"
    round
    @click-overlay="() => (show = false)"
  >
    <view class="logo">
      <NutAvatar size="large"><img :src="config.logo" /></NutAvatar>
    </view>
    <view class="name">
      <span>{{ config.name }}</span>
    </view>
    <view class="version">
      <span>v{{ config.version }}</span>
    </view>
  </nut-popup>
</template>

<script setup lang="ts">
import { useConfig } from "@/composables/config";

const show = defineModel<boolean>();

const config = useConfig();
</script>

<style lang="scss">
.about-content {
  padding: 5%;
  text-align: center;
  width: 500px;

  .name {
    color: var(--theme-color);
    font-size: 40px;
  }
  .version {
    color: var(--text-color-secondary);
    font-size: 32px;
  }
}
</style>
