<template>
  <view class="form-item">
    <view class="title">
      <slot name="title">
        {{ title }}
      </slot>
    </view>
    <view v-if="description || $slots['description']" class="description">
      <slot name="description">
        {{ description }}
      </slot>
    </view>
    <slot></slot>
    <view v-if="error || $slots['error']" class="error">
      <slot name="error">
        <Icon class="error-icon" name="info" :size="25" />{{ error }}
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon.vue";

defineProps<{
  title: string;
  description?: string;
  error?: string | undefined;
}>();
</script>
<style lang="scss">
.form-item {
  display: block;
  padding: 0 2%;
  width: 100%;

  .title {
    font-size: 34px;
    font-weight: bold;
    color: var(--text-color-primary);
    margin-bottom: 15px;
  }
  .description {
    font-size: 26px;
    color: var(--text-color-secondary);
    margin-bottom: 15px;
  }
  .error {
    font-size: 26px;
    color: red;

    .error-icon {
      margin-right: 10px;
      vertical-align: middle;
    }
  }
}
</style>
