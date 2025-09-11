<template>
  <i
    :class="['iconfont', 'nut-icon', name, animateClass]"
    :style="{ color, fontSize: size, width: size, height: size }"
  />
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { computed } from "vue";

const {
  name: _name,
  color = undefined,
  size: _size = 40,
  animate = undefined,
} = defineProps<{
  name: string;
  color?: string | undefined;
  size?: string | number | undefined;
  animate?: string | undefined;
}>();

const name = computed(() => `icon-${_name.replaceAll("-", "_")}`);
const animateClass = computed(() =>
  animate ? `nut-icon-am-${animate}  nut-icon-am-infinite` : "",
);
const size = computed(() =>
  typeof _size === "number" ? Taro.pxTransform(_size) : _size,
);
</script>
