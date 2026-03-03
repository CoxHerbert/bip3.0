<script lang="ts" setup>
import type { CrmCustomerApi } from '#/api/crm/my-customer';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button, Card, Descriptions, Divider, Tag } from 'ant-design-vue';

import { getCustomer } from '#/api/crm/my-customer';

const route = useRoute();
const router = useRouter();

const id = computed(() => Number(route.params.id));
const loading = ref(false);
const data = ref<CrmCustomerApi.Customer>();

function goList() {
  router.push({ name: 'CrmCustomer' });
}
function goEdit() {
  router.push({ name: 'CrmCustomerUpdate', params: { id: id.value } });
}

async function load() {
  loading.value = true;
  try {
    data.value = (await getCustomer(id.value)) as any;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <div class="rounded bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="text-lg font-semibold">
          客户详情 <span class="ml-2 text-gray-500">#{{ id }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Tag v-if="data?.createStatus" color="blue">
            {{ data.createStatus }}
          </Tag>
          <Button @click="goList">返回列表</Button>
          <Button type="primary" @click="goEdit">编辑</Button>
        </div>
      </div>

      <Divider />

      <Card :loading="loading" title="基本信息" class="mb-4">
        <Descriptions :column="2" bordered size="small">
          <Descriptions.Item label="客户全称">
            {{ data?.fullname || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="客户编码">
            {{ data?.customerCode || data?.code || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="法定代表人">
            {{ data?.legalPerson || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="注册资本">
            {{ data?.regCap || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="企业类型">
            {{ data?.regType || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="社会信用代码">
            {{ data?.taxNo || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="经营状态">
            {{ data?.runningStatus || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="企业注册号">
            {{ data?.regCode || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="注册地址" :span="2">
            {{ data?.regAddress || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="成立日期">
            {{ data?.regDate || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="注销日期">
            {{ data?.cancelDate || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="所属工商局" :span="2">
            {{ data?.govBelong || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="经营范围" :span="2">
            {{ data?.companyScope || '-' }}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card :loading="loading" title="客户属性" class="mb-4">
        <Descriptions :column="2" bordered size="small">
          <Descriptions.Item label="客户分类">
            {{ data?.cusCategory ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="人员规模">
            {{ data?.staffSize ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="客户级别">
            {{ data?.cusLevel ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="负责人">
            {{ data?.personInChargeUser ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="共享方式">
            {{ data?.cusShareType ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="共享人">
            {{ data?.sharerUser || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="行业类别">
            {{ data?.sector ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="客户描述" :span="2">
            {{ data?.customerDesc || '-' }}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card :loading="loading" title="厂区与银行" class="mb-4">
        <Descriptions :column="2" bordered size="small">
          <Descriptions.Item label="是否 CM">
            {{ data?.isCm ? '是' : '否' }}
          </Descriptions.Item>
          <Descriptions.Item label="CM 编码">
            {{ data?.cmCode || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="开户银行">
            {{ data?.bankOfDeposit || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="银行卡号">
            {{ data?.bankAccount || '-' }}
          </Descriptions.Item>
          <Descriptions.Item label="附件" :span="2">
            {{ data?.attachments || '-' }}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  </Page>
</template>
