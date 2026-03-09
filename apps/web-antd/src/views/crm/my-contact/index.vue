<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CrmMyContactApi } from '#/api/crm/my-contact';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMyContact, getMyContactPage } from '#/api/crm/my-contact';
import { $t } from '#/locales';

import { useGridColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

function handleRefresh() {
  gridApi.query();
}

function handleCreate() {
  formModalApi.setData(null).open();
}

function handleEdit(row: CrmMyContactApi.Contact) {
  formModalApi.setData(row).open();
}

async function handleDelete(row: CrmMyContactApi.Contact) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.contactsName]),
    duration: 0,
  });
  try {
    await deleteMyContact(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.contactsName]));
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
          return await getMyContactPage({
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
  } as VxeTableGridOptions<CrmMyContactApi.Contact>,
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
              label: $t('ui.actionTitle.create', ['我的客户联系人']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              auth: ['crm:my-contact:create'],
              onClick: handleCreate,
            },
          ]"
        />
      </template>
      <template #contactsName="{ row }">
        <Button type="link" @click="handleEdit(row)">
          {{ row.contactsName }}
        </Button>
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              auth: ['crm:my-contact:update'],
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              auth: ['crm:my-contact:delete'],
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.contactsName]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
