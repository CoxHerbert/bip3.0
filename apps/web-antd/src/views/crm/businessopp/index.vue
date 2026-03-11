<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CrmBusinessOppApi } from '#/api/crm/businessopp';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DocAlert, Page, useVbenModal } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { Button, message, Tabs } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteBusinessOpp,
  exportBusinessOpp,
  getBusinessOppPage,
} from '#/api/crm/businessopp';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import OppsTree from './modules/opps-tree.vue';

const { push } = useRouter();
const sceneType = ref('1');
const selectedCategory = ref('');
const filterParams = ref<Record<string, any>>({});
const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 处理场景类型的切换 */
function handleChangeSceneType(key: number | string) {
  sceneType.value = key.toString();
  gridApi.query();
}

/** 导出表格 */
async function handleExport() {
  const formValues = await gridApi.formApi.getValues();
  const data = await exportBusinessOpp({
    sceneType: sceneType.value,
    ...formValues,
  });
  downloadFileFromBlobPart({ fileName: '商机.xls', source: data });
}

/** 创建商机 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑商机 */
function handleEdit(row: CrmBusinessOppApi.BusinessOpp) {
  formModalApi.setData(row).open();
}

/** 删除商机 */
async function handleDelete(row: CrmBusinessOppApi.BusinessOpp) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.oppsName]),
    duration: 0,
  });
  try {
    await deleteBusinessOpp(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.oppsName]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 查看商机详情 */
function handleDetail(row: CrmBusinessOppApi.BusinessOpp) {
  push({ name: 'CrmOpportunityDetail', params: { id: row.id } });
}

/** 处理分类选择 */
function handleSelectCategory(
  params: null | { fieldName: string; value: boolean | number | string },
) {
  if (params === null) {
    // 点击"全部商机"，清空所有筛选条件
    filterParams.value = {};
    selectedCategory.value = 'all';
  } else {
    // 点击具体选项，设置对应的筛选条件
    filterParams.value = {
      [params.fieldName]: params.value,
    };
    selectedCategory.value = `${params.fieldName}_${params.value}`;
  }
  // 触发表格刷新
  gridApi.query();
}
/** 查看客户详情 */
function handleCustomerDetail(row: CrmBusinessOppApi.BusinessOpp) {
  push({ name: 'CrmCustomerDetail', params: { id: row.customerId } });
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getBusinessOppPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            sceneType: sceneType.value,
            ...formValues,
            ...filterParams.value,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      refresh: true,
      search: true,
    },
  } as VxeTableGridOptions<CrmBusinessOppApi.BusinessOpp>,
});
</script>

<template>
  <Page auto-content-height>
    <template #doc>
      <DocAlert
        title="【商机】商机管理、商机状态"
        url="https://doc.iocoder.cn/crm/business/"
      />
      <DocAlert
        title="【通用】数据权限"
        url="https://doc.iocoder.cn/crm/permission/"
      />
    </template>

    <FormModal @success="handleRefresh" />
    <div class="flex h-full gap-4">
      <!-- 左侧分类树 -->

      <div class="w-62 flex-shrink-0">
        <OppsTree
          :selected-key="selectedCategory"
          @select="handleSelectCategory"
        />
      </div>
      <!-- 右侧表格 -->
      <div class="flex-1 overflow-hidden">
        <Grid>
          <template #toolbar-actions>
            <Tabs class="w-full" @change="handleChangeSceneType">
              <Tabs.TabPane tab="我负责的" key="1" />
              <Tabs.TabPane tab="我参与的" key="2" />
              <Tabs.TabPane tab="下属负责的" key="3" />
            </Tabs>
          </template>
          <template #toolbar-tools>
            <TableAction
              :actions="[
                {
                  label: $t('ui.actionTitle.create', ['商机']),
                  type: 'primary',
                  icon: ACTION_ICON.ADD,
                  auth: ['crm:business:create'],
                  onClick: handleCreate,
                },
                {
                  label: $t('ui.actionTitle.export'),
                  type: 'primary',
                  icon: ACTION_ICON.DOWNLOAD,
                  auth: ['crm:business:export'],
                  onClick: handleExport,
                },
              ]"
            />
          </template>
          <template #oppsName="{ row }">
            <Button type="link" @click="handleDetail(row)">
              {{ row.oppsName }}
            </Button>
          </template>
          <template #customerName="{ row }">
            <Button type="link" @click="handleCustomerDetail(row)">
              {{ row.customerName }}
            </Button>
          </template>
          <template #actions="{ row }">
            <TableAction
              :actions="[
                {
                  label: $t('common.edit'),
                  type: 'link',
                  icon: ACTION_ICON.EDIT,
                  auth: ['crm:business:update'],
                  onClick: handleEdit.bind(null, row),
                },
                {
                  label: $t('common.delete'),
                  type: 'link',
                  danger: true,
                  icon: ACTION_ICON.DELETE,
                  auth: ['crm:business:delete'],
                  popConfirm: {
                    title: $t('ui.actionMessage.deleteConfirm', [row.oppsName]),
                    confirm: handleDelete.bind(null, row),
                  },
                },
              ]"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
