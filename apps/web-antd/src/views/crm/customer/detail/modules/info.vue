<script lang="ts" setup>
import type { CrmCustomerApi } from '#/api/crm/customer';

import { Divider } from 'ant-design-vue';

import { useDescription } from '#/components/description';
import { useFollowUpDetailSchema } from '#/views/crm/followup/data';

import { useDetailBaseSchema } from '../data';

defineProps<{
  customer: CrmCustomerApi.Customer; // 客户信息
}>();

const [BaseDescriptions] = useDescription({
  // title: '基本信息',
  bordered: false,
  column: 4,
  class: 'mx-4',
  schema: useDetailBaseSchema(),
});

const [SystemDescriptions] = useDescription({
  // title: '系统信息',
  bordered: false,
  column: 3,
  class: 'mx-4',
  schema: useFollowUpDetailSchema(),
});
</script>

<template>
  <div>
    <!-- 基本信息 -->
    <div class="mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
      <span class="font-medium text-foreground">基本信息</span>
    </div>
    <BaseDescriptions :data="customer" />
    <Divider />
    <!-- 系统信息 -->
    <div class="mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
      <span class="font-medium text-foreground">系统信息</span>
    </div>
    <SystemDescriptions :data="customer" />
  </div>
</template>
