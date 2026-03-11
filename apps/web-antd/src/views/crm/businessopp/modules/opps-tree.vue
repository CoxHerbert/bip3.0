<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { Button, Input, Tree } from 'ant-design-vue';

interface TreeNode {
  title: string;
  key: string;
  fieldName?: string;
  value?: boolean | number | string;
  children?: TreeNode[];
}

interface FilterParams {
  fieldName: string;
  value: boolean | number | string;
}

const props = defineProps<{
  defaultCollapsed?: boolean;
  selectedKey?: string;
}>();

const emit = defineEmits<{
  collapseChange: [collapsed: boolean];
  select: [params: FilterParams | null];
}>();

const collapsed = ref(props.defaultCollapsed ?? false);
const searchValue = ref('');
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([props.selectedKey || 'all']);

const treeData = computed<TreeNode[]>(() => {
  const root: TreeNode = {
    title: '全部商机',
    key: 'all',
  };

  const fieldConfigs = [
    {
      fieldName: 'oppsStatusId',
      label: '商机状态',
      dictType: DICT_TYPE.CRM_OPPS_STATUS,
      valueType: 'number' as const,
    },
    {
      fieldName: 'fromId',
      label: '商机来源',
      dictType: DICT_TYPE.CRM_OPPS_FROM,
      valueType: 'number' as const,
    },
    {
      fieldName: 'deptId',
      label: '所属部门',
      dictType: DICT_TYPE.CRM_OPPS_DEPARTMENT,
      valueType: 'number' as const,
    },
    {
      fieldName: 'oppsOrgId',
      label: '所属组织',
      dictType: DICT_TYPE.CRM_OPPS_ORGANIZATION,
      valueType: 'string' as const,
    },
    {
      fieldName: 'sectorId',
      label: '行业类别',
      dictType: DICT_TYPE.CRM_PMS_PROJECT_INDUSTRY,
      valueType: 'number' as const,
    },
  ];

  const fieldNodes: TreeNode[] = fieldConfigs.map((config) => {
    const dictOptions = getDictOptions(config.dictType, config.valueType);
    return {
      title: config.label,
      key: config.fieldName,
      children: dictOptions.map((option) => ({
        title: String(option.label),
        key: `${config.fieldName}_${option.value}`,
        fieldName: config.fieldName,
        value: option.value,
      })),
    };
  });

  return [root, ...fieldNodes];
});

const filteredTreeData = computed(() => {
  if (!searchValue.value.trim()) {
    return treeData.value;
  }

  const search = searchValue.value.toLowerCase();
  // @ts-ignore
  function filterNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      const titleMatch = node.title.toLowerCase().includes(search);
      const children = node.children ? filterNodes(node.children) : [];

      if (titleMatch || children.length > 0) {
        result.push({
          ...node,
          children: children.length > 0 ? children : node.children,
        });
      }
    }
    return result;
  }

  return filterNodes(treeData.value);
});

const containerWidth = computed(() => (collapsed.value ? '48px' : '250px'));

watch(
  () => props.selectedKey,
  (newVal) => {
    if (newVal) {
      selectedKeys.value = [newVal];
    }
  },
);

watch(searchValue, (value) => {
  if (value.trim()) {
    const newExpandedKeys: string[] = [];
    treeData.value.forEach((node) => {
      if (node.children) {
        const hasMatch = node.children.some((child) =>
          child.title.toLowerCase().includes(value.toLowerCase()),
        );
        if (hasMatch) {
          newExpandedKeys.push(node.key);
        }
      }
    });
    expandedKeys.value = newExpandedKeys;
  } else {
    expandedKeys.value = treeData.value.map((node) => node.key);
  }
});

watch(
  treeData,
  () => {
    if (expandedKeys.value.length === 0) {
      expandedKeys.value = treeData.value.map((node) => node.key);
    }
  },
  { immediate: true },
);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit('collapseChange', collapsed.value);
}

function findNode(nodes: TreeNode[], key: string): null | TreeNode {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

function handleSelect(selectedKeysValue: (number | string | undefined)[]) {
  if (selectedKeysValue.length > 0) {
    const key = String(selectedKeysValue[0]);
    selectedKeys.value = [key];

    const selectedNode = findNode(treeData.value, key);

    if (selectedNode) {
      if (key === 'all') {
        emit('select', null);
      } else if (selectedNode.fieldName && selectedNode.value !== undefined) {
        emit('select', {
          fieldName: selectedNode.fieldName,
          value: selectedNode.value,
        });
      }
    }
  }
}

function handleExpand(keys: (number | string)[]) {
  expandedKeys.value = keys.map(String);
}
</script>

<template>
  <div
    class="relative h-full overflow-hidden border-r border-border bg-card transition-all duration-300"
    :style="{ width: containerWidth }"
  >
    <div v-show="!collapsed" class="flex h-full flex-col p-3">
      <Input
        v-model:value="searchValue"
        placeholder="搜索筛选条件"
        allow-clear
        class="w-full flex-shrink-0"
      >
        <template #prefix>
          <IconifyIcon icon="lucide:search" class="size-4" />
        </template>
      </Input>
      <div class="mt-2 flex-1 overflow-auto">
        <Tree
          :tree-data="filteredTreeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          @select="handleSelect"
          @expand="handleExpand"
        />
      </div>
    </div>

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
        商机筛选
      </span>
    </div>

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
