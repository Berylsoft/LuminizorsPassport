<template>
  <IconFont font-class-name="iconfont" class-prefix="icon" :name :color :size />
</template>

<script setup lang="ts">
import { IconFont } from "@nutui/icons-vue-taro";
import { computed } from "vue";

const {
  name: _name,
  color = undefined,
  size = "20px",
} = defineProps<{
  name: string;
  color?: string;
  size?: string | number;
}>();

const name = computed(() => _name.replaceAll("-", "_"));
</script>
