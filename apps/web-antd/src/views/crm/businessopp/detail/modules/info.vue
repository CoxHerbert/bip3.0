<script lang="ts" setup>
import type { CrmBusinessOppApi } from '#/api/crm/businessopp';

import { Divider } from 'ant-design-vue';

import { useDescription } from '#/components/description';
import { useFollowUpDetailSchema } from '#/views/crm/followup/data';

import { useDetailBaseSchema } from '../data';

defineProps<{
  business: CrmBusinessOppApi.BusinessOpp; // 商机信息
}>();

const [BaseDescription] = useDescription({
  // title: '基本信息',
  bordered: false,
  column: 4,
  class: 'mx-4',
  schema: useDetailBaseSchema(),
});

const [SystemDescription] = useDescription({
  // title: '系统信息',
  bordered: false,
  column: 3,
  class: 'mx-4',
  schema: useFollowUpDetailSchema(),
});
</script>

<template>
  <div>
    <div class="mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
      <span class="font-medium text-foreground">基本信息</span>
    </div>
    <BaseDescription :data="business" />
    <Divider />
    <!-- 系统信息 -->
    <div class="mb-4 flex items-center gap-2 border-l-4 border-primary pl-3">
      <span class="font-medium text-foreground">系统信息</span>
    </div>
    <SystemDescription :data="business" />
  </div>
</template>
