<template>
  <nut-space direction="vertical" :gutter="25">
    <view class="anouncement">
      <nut-noticebar
        :text="anouncement === '' ? '暂无公告' : anouncement"
        scrollable
      />
    </view>
    <view class="swiper">
      <nut-swiper pagination-visible :auto-play="5000">
        <nut-swiper-item v-for="(item, index) in swiperImageList" :key="index">
          <img :src="item" class="swiper-image" draggable="false" />
        </nut-swiper-item>
      </nut-swiper>
    </view>
    <view class="divider">
      <nut-divider> 常用功能 </nut-divider>
    </view>
    <view class="function-grid">
      <nut-grid :column-num="3" :border="false" clickable square>
        <nut-grid-item
          v-for="(item, index) in functions"
          :key="index"
          :text="item.text"
          class="grid-item"
          @click="router.push({ name: item.target })"
        >
          <Icon :name="item.icon" :size="120" color="var(--theme-color)" />
        </nut-grid-item>
        <nut-grid-item class="grid-item more" text="敬请期待">
          <Icon
            name="more-horizontal"
            :size="120"
            style="color: var(--text-color-secondary) !important"
          />
        </nut-grid-item>
      </nut-grid>
    </view>
  </nut-space>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import img1 from "@/assets/image/2025.jpg";
import Icon from "@/components/Icon.vue";

const router = useRouter();

const anouncement = ref("");
/** @todo get swiper from server */
const swiperImageList = ref([img1]);
const functions = ref([{ icon: "receipt", text: "征集", target: "recruit" }]);
</script>

<style lang="scss">
.nut-space {
  width: 100%;
}

.anouncement {
  --nut-noticebar-background: var(--theme-color-current);
  --nut-noticebar-color: var(--theme-color-reverse);
  // patch for dark mode
  --nut-dark-background2: var(--nut-noticebar-background);
  --nut-dark-color: var(--nut-noticebar-color);
}

.swiper {
  display: flex;
  justify-content: center;

  .nut-swiper {
    border-radius: 20px;
  }
  .nut-swiper-item {
    height: 400px;
  }
  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.divider {
  --nut-divider-text-color: var(--theme-color-dark);
}

.function-grid {
  .grid-item > .nut-grid-item__content {
    border-radius: 20px;
  }
  .grid-item.more > .nut-grid-item__content {
    cursor: default !important;
  }
}
.theme-light {
  .function-grid {
    --nut-grid-item-content-bg-color: #f8f8f8;
  }
}
.theme-dark {
  .function-grid {
    --nut-grid-item-content-bg-color: #222;
  }
}
</style>
