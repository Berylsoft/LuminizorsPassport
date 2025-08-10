<template>
  <template v-if="isWebEnvironment">
    <nut-toast
      v-model:visible="_toastState.show"
      :msg="_toastState.msg"
      :type="_toastState.type"
      :duration="_toastState.duration"
  /></template>
</template>

<script setup lang="ts">
import Taro from "@tarojs/taro";
import { _toastState } from "@/platforms/web";

const isWebEnvironment = Taro.ENV_TYPE.WEB;
</script>
