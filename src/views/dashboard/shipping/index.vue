<template>
  <div class="shipping-container">
    <!-- 头部（float 布局 + 清除浮动） -->
    <div class="header clearfix">
      <div class="header-left fl">
        <img class="logo" src="./images/logo.svg" alt="" />
        <img class="title-img" src="./images/今日出货.svg" alt="" />
      </div>

      <div class="header-right fr">
        <!-- 圆形进度：下一页倒计时 -->
        <div
          class="hr-block fl"
          :title="`下页倒计时 ${slideCountdownText}`"
          aria-label="下一页倒计时"
        >
          <svg
            class="circle-svg"
            :width="CIRCLE_SIZE"
            :height="CIRCLE_SIZE"
            :viewBox="`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`"
          >
            <circle
              :cx="CIRCLE_CENTER"
              :cy="CIRCLE_CENTER"
              :r="circleR"
              class="circle-track"
              :stroke-width="STROKE_WIDTH"
            />
            <circle
              :cx="CIRCLE_CENTER"
              :cy="CIRCLE_CENTER"
              :r="circleR"
              class="circle-progress"
              :stroke-width="STROKE_WIDTH"
              :style="{
                strokeDasharray: circleC,
                strokeDashoffset: slideDashOffset,
              }"
              :transform="`rotate(-90 ${CIRCLE_CENTER} ${CIRCLE_CENTER})`"
            />
            <text
              :x="CIRCLE_CENTER"
              :y="CIRCLE_CENTER + 10"
              text-anchor="middle"
              class="circle-label"
            >
              下一页
            </text>
          </svg>
        </div>

        <!-- 圆形进度：数据刷新倒计时 -->
        <div
          class="hr-block fl"
          :title="`刷新倒计时 ${refreshCountdownText}`"
          aria-label="刷新数据倒计时"
        >
          <svg
            class="circle-svg"
            :width="CIRCLE_SIZE"
            :height="CIRCLE_SIZE"
            :viewBox="`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`"
          >
            <circle
              :cx="CIRCLE_CENTER"
              :cy="CIRCLE_CENTER"
              :r="circleR"
              class="circle-track"
              :stroke-width="STROKE_WIDTH"
            />
            <circle
              :cx="CIRCLE_CENTER"
              :cy="CIRCLE_CENTER"
              :r="circleR"
              class="circle-progress"
              :stroke-width="STROKE_WIDTH"
              :style="{
                strokeDasharray: circleC,
                strokeDashoffset: refreshDashOffset,
              }"
              :transform="`rotate(-90 ${CIRCLE_CENTER} ${CIRCLE_CENTER})`"
            />
            <text
              :x="CIRCLE_CENTER"
              :y="CIRCLE_CENTER + 10"
              text-anchor="middle"
              class="circle-label"
            >
              刷新
            </text>
          </svg>
        </div>

        <!-- 时间 -->
        <div class="hr-block fl" style="width: 200px">
          <div class="shippingTime">{{ currentDate }}</div>
          <div class="shippingTime2">
            <span>{{ currentWeekday }}</span>
            <span>{{ currentTime }}</span>
          </div>
        </div>

        <!-- 天气 -->
        <div class="hr-block fl" style="width: 140px">
          <div class="shippingDate">{{ userDetail.weather || '-' }}</div>
          <div class="shippingDate">
            {{ userDetail.adressName || '-' }} {{ userDetail.temperature || '-' }}°C
          </div>
        </div>

        <div class="hr-block fl" style="width: 100px">
          <img class="weather-img" :src="weatherImg" alt="" />
        </div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="content">
      <div class="card">
        <!-- 轮播（自研）：只有活动项显示，切换时重算行数 -->
        <div class="carousel">
          <div
            v-for="(page, pi) in pages"
            :key="pi"
            class="carousel-item"
            :class="{ 'is-active': activeIndex === pi }"
            v-show="activeIndex === pi"
          >
            <!-- 单表模式（如需双表，参考 TABLES_PER_SLIDE=2 扩展） -->
            <div class="table-wrap">
              <!-- 表头单独 table，避免 sticky/position -->
              <table class="data-table header-table" cellspacing="0" cellpadding="0">
                <colgroup>
                  <col v-for="(col, ci) in columns" :key="'h' + ci" />
                </colgroup>
                <thead>
                  <tr>
                    <th v-for="(col, ci) in columns" :key="ci" class="th-cell">
                      {{ col.label }}
                    </th>
                  </tr>
                </thead>
              </table>

              <!-- 可滚动表体，固定高度由 JS 计算 -->
              <div class="tbody-scroller" :style="{ height: tableBodyHeight + 'px' }">
                <table class="data-table body-table" cellspacing="0" cellpadding="0">
                  <colgroup>
                    <col v-for="(col, ci) in columns" :key="'b' + ci" />
                  </colgroup>
                  <tbody>
                    <tr v-for="(row, ri) in page.left" :key="ri" class="tr-row">
                      <td v-for="(col, ci) in columns" :key="ci" class="td-cell">
                        <template v-if="col.type === 'status'">
                          <span
                            class="status-tag"
                            :class="row[col.prop] === '进行中' ? 'status-danger' : 'status-success'"
                          >
                            <span class="status-text">{{ row[col.prop] }}</span>
                          </span>
                        </template>
                        <template v-else>
                          {{ row[col.prop] }}
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 指示点 -->
            <ul class="indicators clearfix" v-if="totalPages > 1">
              <li
                v-for="(dot, di) in totalPages"
                :key="di"
                class="dot fl"
                :class="{ active: activeIndex === di - 1 }"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import Api from '@/api/index';
import { useRoute } from 'vue-router';

const route = useRoute();

/** ======= 列定义（原生表格） ======= */
const columns = reactive([
  { prop: 'projectNo', label: '专案号', align: 'center' },
  { prop: 'splitAmount', label: '数量', align: 'center' },
  { prop: 'dri', label: 'DRI', align: 'center' },
  // 如需状态列：{ prop: 'status', label: '状态', type: 'status', align: 'center' },
]);

/** ======= 状态 ======= */
const pageData = reactive({
  loading: false,
  userDetail: {},
  weatherImg: '',
  localUrl: '',
  tableData: [],
});
const { loading, userDetail, weatherImg, localUrl, tableData } = toRefs(pageData);

/** ======= 分页 / 表高计算 ======= */
const ROW_HEIGHT = 72;
const HEADER_HEIGHT = 72;
const TABLES_PER_SLIDE = 1;

const tableBodyHeight = ref(0);
const rowsPerTable = ref(0);
const pages = ref([]); // [{ left: [], right: [] }, ...]
const totalPages = ref(0);
const activeIndex = ref(0);

/** ======= 轮播 & 倒计时 ======= */
const carouselInterval = ref(30000);
const carouselIntervalSec = computed(() => Math.ceil(carouselInterval.value / 1000));
const slideRemainSec = ref(carouselIntervalSec.value);
let slideTickTimer = null;

// 30分钟刷新
const REFRESH_SEC = 30 * 60;
const refreshRemainSec = ref(REFRESH_SEC);
let refreshTickTimer = null;

const pad2 = n => (n < 10 ? `0${n}` : String(n));
const formatCountdown = sec => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
};
const slideCountdownText = computed(() => formatCountdown(slideRemainSec.value));
const refreshCountdownText = computed(() => formatCountdown(refreshRemainSec.value));

/** ======= SVG 圆环（小一号） ======= */
const CIRCLE_SIZE = 76; // 原 88
const STROKE_WIDTH = 4;
const CIRCLE_CENTER = CIRCLE_SIZE / 2;
const circleR = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const circleC = 2 * Math.PI * circleR;

const slidePercent = computed(() => {
  const elapsed = Math.max(carouselIntervalSec.value - slideRemainSec.value, 0);
  return Math.min(Math.round((elapsed / carouselIntervalSec.value) * 100), 100);
});
const refreshPercent = computed(() => {
  const elapsed = Math.max(REFRESH_SEC - refreshRemainSec.value, 0);
  return Math.min(Math.round((elapsed / REFRESH_SEC) * 100), 100);
});
const slideDashOffset = computed(() => circleC * (1 - slidePercent.value / 100));
const refreshDashOffset = computed(() => circleC * (1 - refreshPercent.value / 100));

/** ======= 计算行数（避免 position，基于容器实际高度） ======= */
const calcRows = () => {
  const card = document.querySelector('.shipping-container .content .card');
  if (!card) return;

  const activeItem = document.querySelector('.shipping-container .carousel-item.is-active');
  let itemPT = 15,
    itemPB = 32;
  if (activeItem) {
    const istyle = getComputedStyle(activeItem);
    itemPT = parseFloat(istyle.paddingTop) || itemPT;
    itemPB = parseFloat(istyle.paddingBottom) || itemPB;
  }

  const available = card.clientHeight - itemPT - itemPB;
  const bodyH = available - HEADER_HEIGHT;
  const rows = Math.floor(bodyH / ROW_HEIGHT);

  rowsPerTable.value = Math.max(rows, 0);
  tableBodyHeight.value = rowsPerTable.value * ROW_HEIGHT;
};

const paginate = () => {
  const data = tableData.value || [];
  const rowsPerSlide = rowsPerTable.value * TABLES_PER_SLIDE;

  if (rowsPerSlide <= 0) {
    pages.value = [];
    totalPages.value = 0;
    activeIndex.value = 0;
    return;
  }

  const result = [];
  for (let start = 0; start < data.length; start += rowsPerSlide) {
    const chunk = data.slice(start, start + rowsPerSlide);
    const left = chunk.slice(0, rowsPerTable.value);
    const right = chunk.slice(rowsPerTable.value, rowsPerSlide);
    result.push({ left, right });
  }
  pages.value = result;
  totalPages.value = result.length;
  if (activeIndex.value >= totalPages.value) activeIndex.value = 0;
};

/** ======= 轮播自动翻页（基于秒级倒计时） ======= */
const goNext = async () => {
  if (totalPages.value <= 0) return;
  activeIndex.value = (activeIndex.value + 1) % totalPages.value;
  await nextTick();
  calcRows();
};

const resetSlideCountdown = () => {
  slideRemainSec.value = carouselIntervalSec.value;
};
const startSlideCountdown = () => {
  if (slideTickTimer) clearInterval(slideTickTimer);
  resetSlideCountdown();
  slideTickTimer = setInterval(async () => {
    slideRemainSec.value--;
    if (slideRemainSec.value <= 0) {
      await goNext();
      resetSlideCountdown();
    }
  }, 1000);
};

/** ======= 数据刷新倒计时 ======= */
const lastWeatherParams = ref(null);
const startRefreshCountdown = () => {
  if (refreshTickTimer) clearInterval(refreshTickTimer);
  refreshRemainSec.value = REFRESH_SEC;
  refreshTickTimer = setInterval(() => {
    refreshRemainSec.value--;
    if (refreshRemainSec.value <= 0) {
      if (lastWeatherParams.value) getData(lastWeatherParams.value);
      refreshRemainSec.value = REFRESH_SEC;
    }
  }, 1000);
};

/** ======= 数据请求 ======= */
const getList = () => {
  const params = { groupName: route.query.groupName };
  return Api.dashboard.shipping.getShipList({ page: 1, size: 500, ...params }).then(async res => {
    const { code, data } = res.data || {};
    if (code === 200) {
      tableData.value = (data.records || []).map((r, i) => ({ index: i + 1, ...r }));
      await nextTick();
      calcRows();
      paginate();
    }
  });
};

const getData = params => {
  lastWeatherParams.value = params;
  loading.value = true;
  Api.desk.home
    .getWeather(params)
    .then(res => {
      const { data } = res;
      userDetail.value = data || {};
      weatherImg.value = `https://static.eastwinbip.com/static/weather/${userDetail.value?.weatherCode}.svg`;
      localUrl.value = `/img/weather_pic/${
        /^[dn]/.test(userDetail.value?.weatherCode || '') ? '' : 'n'
      }${userDetail.value?.weatherCode}.png`;
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

const getLocal = () => {
  const params = { lng: '113.83', lat: '23.02' };
  getData(params);
};

/** ======= 时间展示 ======= */
dayjs.locale('zh-cn');
const currentTime = ref('');
const currentDate = ref('');
const currentWeekday = ref('');
const updateTime = () => {
  const now = dayjs();
  currentTime.value = now.format('HH:mm');
  currentDate.value = now.format('YYYY-MM-DD');
  currentWeekday.value = now.format('dddd');
};

/** ======= 生命周期 ======= */
const onWinResize = () =>
  nextTick(() => {
    calcRows();
    paginate();
  });

onMounted(async () => {
  updateTime();
  const timer = setInterval(updateTime, 1000);
  window.timeUpdateTimer = timer;

  getLocal();
  await getList();

  await nextTick();
  calcRows();
  paginate();

  startRefreshCountdown();
  startSlideCountdown();

  window.addEventListener('resize', onWinResize);
});

onUnmounted(() => {
  clearInterval(window.timeUpdateTimer);
  if (refreshTickTimer) clearInterval(refreshTickTimer);
  if (slideTickTimer) clearInterval(slideTickTimer);
  window.removeEventListener('resize', onWinResize);
});

watch(tableData, () =>
  nextTick(() => {
    calcRows();
    paginate();
  })
);
watch(activeIndex, () =>
  nextTick(() => {
    calcRows();
  })
);
</script>

<style lang="scss" scoped>
/* ======= 工具类 ======= */
.fl {
  float: left;
}
.fr {
  float: right;
}
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* ======= 页面框架 ======= */
.shipping-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background-image: url('./image/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* ======= 头部（float 布局） —— 小一号 ======= */
.header {
  width: 100%;
  height: 140px; /* 原 160px */
  padding: 0 15px;
  padding-top: 24px; /* 原 30px */
  background: #fdece0;

  /* 左侧强制单行、不换行 */
  .header-left {
    display: flex; /* 让内部图片并排 */
    align-items: center;
    gap: 18px; /* 等同原 margin-left:18px 的视觉间距 */
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 宽度不够时裁切（避免把右侧挤换行导致抖动） */
    .logo {
      height: 52px; /* 原 60px */
      vertical-align: middle;
      flex: 0 0 auto;
    }
    .title-img {
      height: 52px; /* 原 60px */
      width: auto;
      vertical-align: middle;
      flex: 0 1 auto;
    }
  }

  .header-right {
    .hr-block {
      margin-left: 16px;
    }
  }
}

/* 原有基础尺寸（小一号） */
.shippingTime {
  font-weight: 500;
  font-size: 36px; /* 原 40px */
  color: #f78431;
  line-height: 36px; /* 原 40px */
  text-align: center;
}
.shippingTime2 {
  display: block;
  font-weight: 500;
  font-size: 28px; /* 原 30px */
  color: #333;
  line-height: 28px; /* 原 30px */
  text-align: center;
  > span:first-child {
    margin-right: 8px;
  }
}
.shippingDate {
  font-weight: 500;
  font-size: 22px; /* 原 24px */
  color: #333;
  line-height: 36px; /* 原 40px */
  text-align: center;
}
.weather-img {
  max-height: 56px; /* 原 66px */
}

/* ======= 内容卡片 ======= */
.content {
  width: 100%;
  height: calc(100% - 140px); /* 原 calc(100% - 160px) */
  background-color: #eeeff5;

  .card {
    width: calc(100% - 30px);
    height: calc(100% - 30px);
    margin: 15px;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
}

/* ======= 轮播 ======= */
.carousel {
  height: 100%;

  .carousel-item {
    padding: 15px 15px 32px 15px;
    height: 100%;
  }

  .indicators {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 0;
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #bbb;
      margin-right: 6px;
    }
    .dot.active {
      width: 12px;
      height: 12px;
      background: #f78431;
    }
  }
}

/* ======= 表格（原生） ======= */
.table-wrap {
  height: calc(100% - 28px);
  border: 1px solid rgba(218, 219, 224, 1);
  border-radius: 12px;
  overflow: hidden;
  padding: 0;

  .data-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    th,
    td {
      border-bottom: 1px solid #eee;
      text-align: center;
      padding: 0 6px;
      color: #0f0f0f;
      font-weight: 500;
    }
    .th-cell {
      height: 72px;
      font-size: 32px;
      line-height: 72px;
      background: #fafafa;
      font-weight: 600;
    }
    .tr-row {
      height: 72px;
    }
    .td-cell {
      height: 72px;
      font-size: 32px;
      line-height: 72px;
    }
  }

  .tbody-scroller {
    overflow: auto;
  }
}

/* ======= 状态标签（原生） ======= */
.status-tag {
  display: inline-block;
  padding: 16px 8px;
  border-radius: 6px;
  background: #f6f6f6;
}
.status-danger {
  background: #ffecec;
  color: #d7000f;
}
.status-success {
  background: #eaffea;
  color: #129a00;
}
.status-text {
  font-size: 24px;
  font-weight: 600;
}

/* ======= SVG 圆环样式 ======= */
.circle-svg {
  display: inline-block;
}
.circle-track {
  fill: none;
  stroke: #eee;
}
.circle-progress {
  fill: none;
  stroke: #f78431;
  transition: stroke-dashoffset 0.3s linear;
}
.circle-icon-text {
  font-size: 20px;
  fill: #333;
}
.circle-label {
  font-size: 16px; /* 原 18px */
  fill: #333;
}

/* === 覆盖：放大头部文字的版本（保留注释，按需启用）
.header { padding: 0 18px; }
.shippingTime { font-size: 54px; line-height: 54px; font-weight: 600; }
.shippingTime2 { font-size: 38px; line-height: 38px; font-weight: 600; }
.shippingDate { font-size: 30px; line-height: 44px; font-weight: 600; }
.weather-img { max-height: 80px; }
.circle-icon-text { font-size: 26px; }
.circle-label { font-size: 14px; }
*/
</style>
