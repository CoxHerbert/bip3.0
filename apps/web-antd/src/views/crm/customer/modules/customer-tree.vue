<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Input, Tree } from 'ant-design-vue';

const props = defineProps<{
  defaultCollapsed?: boolean;
  selectedKey?: string;
}>();

const emit = defineEmits<{
  collapseChange: [collapsed: boolean];
  select: [key: string];
}>();

// 是否折叠
const collapsed = ref(props.defaultCollapsed ?? false);
// 搜索值
const searchValue = ref('');

// 商机分类树数据
const treeData = ref([
  {
    title: '全部商机',
    key: 'all',
    children: [
      { title: '初步接洽', key: 'initial' },
      { title: '需求确定', key: 'requirement' },
      { title: '方案报价', key: 'quotation' },
      { title: '谈判审核', key: 'negotiation' },
      { title: '赢单', key: 'win' },
      { title: '输单', key: 'lose' },
      { title: '中止', key: 'abort' },
    ],
  },
]);

const selectedKeys = ref<string[]>([props.selectedKey || 'all']);

// 计算宽度
const containerWidth = computed(() => (collapsed.value ? '48px' : '250px'));

// 监听外部 selectedKey 变化
watch(
  () => props.selectedKey,
  (newVal) => {
    if (newVal) {
      selectedKeys.value = [newVal];
    }
  },
);

/** 切换折叠状态 */
function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit('collapseChange', collapsed.value);
}

/** 处理分类选择 */
function handleSelect(selectedKeysValue: (number | string | undefined)[]) {
  if (selectedKeysValue.length > 0) {
    const key = String(selectedKeysValue[0]);
    selectedKeys.value = [key];
    emit('select', key);
  }
}
</script>

<template>
  <div
    class="relative h-full overflow-hidden border-r border-border bg-card transition-all duration-300"
    :style="{ width: containerWidth }"
  >
    <!-- 展开状态 -->
    <div v-show="!collapsed" class="flex h-full flex-col p-3">
      <!-- 搜索框 -->
      <Input
        v-model:value="searchValue"
        placeholder="搜索商机阶段"
        allow-clear
        class="w-full flex-shrink-0"
      >
        <template #prefix>
          <IconifyIcon icon="lucide:search" class="size-4" />
        </template>
      </Input>
      <!-- 树内容 -->
      <div class="mt-2 flex-1 overflow-auto">
        <Tree
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          default-expand-all
          @select="handleSelect"
        />
      </div>
    </div>

    <!-- 折叠状态 -->
    <div
      v-show="collapsed"
      class="flex h-full items-center justify-center bg-card"
    >
      <span
        class="text-sm font-medium text-foreground"
        style="
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 4px;
        "
      >
        客户分类树
      </span>
    </div>

    <!-- 折叠按钮 -->
    <div class="absolute bottom-2 right-2 z-10">
      <Button type="text" size="small" @click="toggleCollapse">
        <IconifyIcon
          icon="lucide:panel-left-close"
          class="size-4"
          v-if="!collapsed"
        />
        <IconifyIcon icon="lucide:panel-left-open" class="size-4" v-else />
      </Button>
    </div>
  </div>
</template>
