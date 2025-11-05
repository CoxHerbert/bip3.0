<template>
  <div :class="{ hidden }" class="pagination-container">
    <el-pagination
      :key="paginationKey"
      :background="background"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :layout="innerLayout"
      :page-sizes="pageSizesNormalized"
      :pager-count="pagerCount"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { scrollTo } from '@/utils/scroll-to';

const props = defineProps({
  total: { type: Number, required: true },
  page: { type: Number, default: 1 },
  limit: { type: [Number, String], default: 20 }, // 允许父层传字符串，内部转数字
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 9999],
  },
  allValue: { type: Number, default: 9999 },
  autoCompactWhenAll: { type: Boolean, default: true },
  pagerCount: { type: Number, default: document.body.clientWidth < 992 ? 5 : 7 },
  layout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
  background: { type: Boolean, default: true },
  autoScroll: { type: Boolean, default: true },
  hidden: { type: Boolean, default: false },
});

const emit = defineEmits(['update:page', 'update:limit', 'pagination']);

// 统一为数字
const pageSize = computed({
  get: () => Number(props.limit) || 1,
  set: val => emit('update:limit', Number(val)),
});

const currentPage = computed({
  get: () => props.page,
  set: val => emit('update:page', val),
});

// 1) 规范化 pageSizes：保证当前 pageSize 一定在数组里（避免显示成第一个值）
const pageSizesNormalized = computed(() => {
  const base = (props.pageSizes || []).map(n => Number(n)).filter(Boolean);
  const s = Number(pageSize.value);
  return base.includes(s) ? base : [...base, s].sort((a, b) => a - b);
});

// 2) 选“全部”时可精简布局（保持你原逻辑）
const isAll = computed(() => pageSize.value === Number(props.allValue));
const innerLayout = computed(() =>
  props.autoCompactWhenAll && isAll.value ? 'total, prev, next, jumper' : props.layout
);

// 3) 关键字段变化时强制刷新组件（修复初渲染不同步）
const paginationKey = computed(
  () => `${pageSize.value}-${pageSizesNormalized.value.join(',')}-${props.total}`
);

function handleSizeChange(val) {
  const v = Number(val);
  if (currentPage.value * v > props.total || v === Number(props.allValue)) {
    currentPage.value = 1;
  }
  emit('pagination', { page: currentPage.value, limit: v });
  if (props.autoScroll) scrollTo(0, 800);
}

function handleCurrentChange(val) {
  emit('pagination', { page: val, limit: pageSize.value });
  if (props.autoScroll) scrollTo(0, 800);
}

// 防越界（保持你原本思路）
watch(
  () => [props.total, pageSize.value, currentPage.value],
  () => {
    const size = Math.max(1, Number(pageSize.value) || 1);
    const maxPage = Math.max(1, Math.ceil((props.total || 0) / size));
    if (currentPage.value > maxPage) {
      currentPage.value = 1;
      emit('pagination', { page: 1, limit: size });
    }
  }
);
</script>

<style scoped>
.pagination-container {
  background: #fff;
}
.pagination-container.hidden {
  display: none;
}
</style>
