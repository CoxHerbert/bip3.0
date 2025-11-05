<template>
  <div class="carousel-container">
    <el-carousel
      :indicator-position="indicatorPosition"
      :autoplay="autoplay"
      height="100%"
      :interval="interval"
      :arrow="arrow"
      @change="handleChange"
    >
      <!-- 轮播项 -->
      <el-carousel-item v-for="(item, index) in carouselData" :key="item.key || index">
        <div class="carousel-content">
          <!-- 使用栅格布局展示图片 -->
          <el-row :gutter="gutter">
            <el-col
              :span="24 / imagesPerSlide"
              v-for="(img, imgIndex) in item.images"
              :key="img.key || imgIndex"
            >
              <div class="image-item" @click="handleImageClick(img, index, imgIndex)">
                <div class="image-box">
                  <img
                    :src="img.leaderImage"
                    class="carousel-image"
                    :loading="img.loading || 'lazy'"
                  />
                </div>

                <div class="userInfo">
                  <div class="user-title">
                    <div class="user-name">{{ img.currentNodeUserName }}</div>
                    <div class="user-dep">{{ img.leaderUserDept }}</div>
                  </div>
                  <div class="image-title" v-if="showImageTitle">{{ img.leaderUserPhone }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue';

const props = defineProps({
  // 轮播数据
  carouselData: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 指示器位置
  indicatorPosition: {
    type: String,
    default: 'outside',
    validator: value => ['outside', 'inside', 'none'].includes(value),
  },
  // 是否自动轮播
  autoplay: {
    type: Boolean,
    default: true,
  },
  // 轮播间隔时间
  interval: {
    type: Number,
    default: 3000,
  },
  // 箭头显示时机
  arrow: {
    type: String,
    default: 'never',
    validator: value => ['always', 'hover', 'never'].includes(value),
  },
  // 图片间距
  gutter: {
    type: Number,
    default: 30,
  },
  // 每页显示图片数量
  imagesPerSlide: {
    type: Number,
    default: 3,
    validator: value => value >= 1 && value <= 6,
  },
  // 是否显示图片标题
  showImageTitle: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits([
  'change', // 轮播切换时触发
  'image-click', // 图片点击时触发
]);

// 轮播切换处理
const handleChange = currentIndex => {
  emits('change', currentIndex);
};

// 图片点击处理
const handleImageClick = (image, carouselIndex, imageIndex) => {
  emits('image-click', {
    image,
    carouselIndex,
    imageIndex,
  });
};

// 组件挂载后执行
onMounted(() => {
  console.log('ImageCarousel component mounted');
});
</script>

<style scoped>
/* Edge浏览器兼容性样式 */
@supports (-ms-ime-align: auto) {
  .carousel-container {
    -ms-flex: 1 1 auto;
    -ms-flex-direction: column;
  }

  .image-item {
    -ms-flex: 1 1 auto;
    -ms-flex-direction: column;
  }
}

/* Edge浏览器特定样式 */
@supports (-ms-accelerator: true) {
  .carousel-container {
    display: -ms-flexbox;
    -ms-flex-direction: column;
  }

  .image-item {
    display: -ms-flexbox;
    -ms-flex-direction: column;
  }
}

/* 通用轮播容器样式 */
:deep(.el-carousel) {
  height: 100%;
  width: 100%;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;

  .el-carousel__container {
    height: 100%;
    width: 100%;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;

    .el-row {
      height: 100%;
      width: 100%;
      -webkit-flex: 1;
      -ms-flex: 1;
      flex: 1;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-flex-direction: row;
      -ms-flex-direction: row;
      flex-direction: row;

      .el-col {
        height: 100%;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-direction: column;
        -ms-flex-direction: column;
        flex-direction: column;
      }
    }
  }
}

.carousel-container {
  width: 100%;
  height: 100%;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  position: relative;
  /* 确保在Edge浏览器中正确计算高度 */
  min-height: 720px;
  /* 防止内容溢出 */
  overflow: hidden;
}

.carousel-content {
  padding: 10px;
  height: 100%;
  width: 100%;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
}

.userInfo {
  padding-top: 10px;
  width: 100%;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}

.image-item {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  border-radius: 10px;
  background-color: #fff;
  overflow: hidden;
  height: 100%;
  padding: 15px;
  -webkit-transition: transform 0.3s ease, box-shadow 0.3s ease;
  -moz-transition: transform 0.3s ease, box-shadow 0.3s ease;
  -ms-transition: transform 0.3s ease, box-shadow 0.3s ease;
  -o-transition: transform 0.3s ease, box-shadow 0.3s ease;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  /* 确保在Edge浏览器中正确计算高度 */
  min-height: 650px;
}

.image-box {
  /* -webkit-flex: 0.9;
  -ms-flex: 0.9;
  flex: 0.9; */
  flex: 0.7;
  overflow: hidden;
  border-radius: 10px;
  min-height: 500px;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  position: relative;
  /* 确保在Edge浏览器中图片容器正确显示 */
  width: 100%;
  height: 500px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  object-fit: cover;
  border-radius: 10px;
  -webkit-transition: transform 0.5s ease;
  -moz-transition: transform 0.5s ease;
  -ms-transition: transform 0.5s ease;
  -o-transition: transform 0.5s ease;
  transition: transform 0.5s ease;
  display: block;
  /* 解决Edge浏览器中图片显示问题 */
  -ms-interpolation-mode: bicubic;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  /* 确保图片在Edge浏览器中正确显示 */
  max-width: 100%;
  max-height: 100%;
}

.user-title {
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  /* 确保在Edge浏览器中正确显示 */
  min-height: 60px;
}

.user-name {
  font-family: 'MyCustomFont', sans-serif;
  font-weight: 400;
  font-size: 48px;
  color: #333333;
  line-height: 48px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  /* Edge浏览器字体渲染优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 防止文字换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  /* 确保在Edge浏览器中正确显示 */
  min-width: 0;
  flex-shrink: 1;
}

.user-dep {
  font-size: 28px;
  padding: 3px 10px;
  margin-left: 10px;
  color: #fff;
  background: linear-gradient(90deg, rgba(225, 33, 55, 0.7) 0%, rgba(242, 147, 70, 0.45) 100%);
  /* Edge浏览器字体渲染优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 防止文字换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  /* 确保在Edge浏览器中正确显示 */
  min-width: 0;
  flex-shrink: 1;
}

.image-title {
  text-align: center;
  font-size: 32px;
  color: #606266;
  background-color: rgba(255, 255, 255, 0.9);
  /* Edge浏览器字体渲染优化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 防止文字换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 5px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  /* 确保在Edge浏览器中正确显示 */
  min-width: 0;
  flex-shrink: 1;
}

@media (max-width: 768px) {
  .user-name {
    font-size: 28px !important;
  }

  .user-dep {
    font-size: 18px !important;
  }

  .image-title {
    font-size: 20px !important;
  }

  .image-box {
    min-height: 300px !important;
    height: 300px !important;
  }

  .image-item {
    min-height: 450px !important;
  }

  .carousel-container {
    min-height: 520px !important;
  }
}
</style>
