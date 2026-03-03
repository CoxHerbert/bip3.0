<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CrmCustomerApi } from '#/api/crm/my-customer';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { downloadFileFromBlobPart } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteCustomer, getCustomerPage } from '#/api/crm/my-customer';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';

const { push } = useRouter();

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 导出表格 */
async function handleExport() {
  const data = await exportClue({
    ...(await gridApi.formApi.getValues()),
  });
  downloadFileFromBlobPart({ fileName: '客户.xls', source: data });
}

/** 创建客户 */
function handleCreate() {
  push({ name: 'CrmMyCustomerCreate' });
}

/** 编辑客户 */
async function handleEdit(row: CrmCustomerApi.Customer) {
  push({ name: 'CrmMyCustomerUpdate', params: { id: row.id } });
}

/** 删除客户 */
async function handleDelete(row: CrmCustomerApi.Customer) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.id]),
    duration: 0,
  });
  try {
    await deleteCustomer(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.id]));
    handleRefresh();
  } catch {
    hideLoading();
  }
}

/** 查看客户详情 */
function handleDetail(row: CrmCustomerApi.Customer) {
  push({ name: 'CrmMyCustomerDetail', params: { id: row.id } });
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
          return await getCustomerPage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
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
  } as VxeTableGridOptions<CrmCustomerApi.Customer>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid>
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['客户']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['crm:my-customer:create'],
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.export'),
              type: 'primary',
              icon: ACTION_ICON.DOWNLOAD,
              auth: ['crm:my-customer:export'],
              onClick: handleExport,
            },
          ]"
        />
      </template>
      <template #fullname="{ row }">
        <Button type="link" @click="handleDetail(row)">
          {{ row.fullname }}
        </Button>
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['crm:my-customer:edit'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('ui.actionTitle.detail'),
              type: 'link',
              icon: ACTION_ICON.VIEW,
              auth: ['crm:my-customer:query'],
              onClick: handleDetail.bind(null, row),
            },
            {
              label: $t('ui.actionTitle.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['crm:my-customer:delete'],
              onClick: handleDelete.bind(null, row),
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
