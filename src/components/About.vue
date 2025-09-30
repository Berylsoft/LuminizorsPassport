<template>
  <nut-popup
    v-if="show"
    v-model:visible="show"
    pop-class="about-content"
    round
    @click-overlay="show = false"
  >
    <view class="logo">
      <NutAvatar size="large">
        <image class="logo-image" lazy-load :src="config.logo" />
      </NutAvatar>
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

const show = defineModel<boolean>({ required: true });

const config = useConfig();
</script>

<style lang="scss">
.about-content {
  padding: 5%;
  text-align: center;
  width: 500px;

  .logo-image {
    width: 100%;
    height: 100%;
  }
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
