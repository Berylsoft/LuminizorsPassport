<template>
  <view>
    <nut-space direction="vertical" :gutter="25">
      <view class="anouncement">
        <nut-noticebar
          :text="anouncement === '' ? '暂无公告' : anouncement"
          scrollable
        />
      </view>
      <view class="swiper">
        <nut-swiper pagination-visible :auto-play="5000">
          <nut-swiper-item
            v-for="(item, index) in swiperImageList"
            :key="index"
          >
            <img :src="item" class="swiper-image" draggable="false" />
          </nut-swiper-item>
        </nut-swiper>
      </view>
      <view class="divider">
        <nut-divider style="color: var(--text-color-secondary)"
          ><span>常用功能</span></nut-divider
        >
      </view>
      <view class="function-grid">
        <nut-grid
          :column-num="3"
          :border="false"
          clickable
          gutter="10px"
          square
        >
          <nut-grid-item
            v-for="(item, index) in functions"
            :key="index"
            :text="item.text"
            class="grid-item"
            @click="() => router.push({ path: `/recruit/` })"
          >
            <Icon :name="item.icon" :size="64" />
          </nut-grid-item>
          <nut-grid-item class="grid-item more" text="敬请期待">
            <Icon
              name="more-horizontal"
              :size="64"
              style="color: var(--text-color-secondary) !important"
            />
          </nut-grid-item>
        </nut-grid>
      </view>
    </nut-space>
  </view>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import img1 from "@/assets/image/swiper/1.jpg";

const router = useRouter();

const anouncement = ref("");
const swiperImageList = ref([img1]);
const functions = ref([{ icon: "receipt", text: "征集", path: "/recruit/" }]);
</script>

<style lang="scss">
.nut-space {
  width: 100%;
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
  span {
    color: var(--text-color-primary);
  }
}

.function-grid {
  --nut-grid-item-text-color: var(white, --text-color-secondary);
  .grid-item > * {
    border-radius: 20px;
  }
  .grid-item.more > * {
    cursor: default !important;
  }
}
.theme-light {
  .function-grid {
    .grid-item > * {
      background-color: #f8f8f8;
    }
  }
}
.theme-dark {
  .function-grid {
    .grid-item > * {
      background-color: #222;
    }
  }
}
</style>
