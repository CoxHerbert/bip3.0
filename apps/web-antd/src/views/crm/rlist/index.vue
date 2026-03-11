<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CrmRListApi } from '#/api/crm/rlist';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRList, getRListPage } from '#/api/crm/rlist';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import RListForm from './modules/rlist-form.vue';

defineOptions({ name: 'CrmRList' });

const { push } = useRouter();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: RListForm,
  destroyOnClose: true,
});

function handleRefresh() {
  gridApi.query();
}

function handleCreate() {
  formModalApi.setData({}).open();
}

function handleEdit(row: CrmRListApi.RList) {
  formModalApi.setData({ id: row.id }).open();
}

function handleDetail(row: CrmRListApi.RList) {
  push({ name: 'CrmRListDetail', params: { id: row.id } });
}

async function handleDelete(row: CrmRListApi.RList) {
  const hideLoading = message.loading({
    content: `正在删除需求单：${row.rlistName}`,
    duration: 0,
  });
  try {
    await deleteRList(row.id as number);
    message.success($t('ui.actionMessage.deleteSuccess', [row.rlistName]));
    handleRefresh();
  } finally {
    hideLoading();
  }
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
          return await getRListPage({
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
  } as VxeTableGridOptions<CrmRListApi.RList>,
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid table-title="需求单列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['需求单']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              onClick: handleCreate,
            },
          ]"
        />
      </template>

      <template #rlistName="{ row }">
        <a class="text-primary hover:underline" @click="handleDetail(row)">
          {{ row.rlistName }}
        </a>
      </template>

      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              popConfirm: {
                title: `确认删除需求单【${row.rlistName}】吗？`,
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
