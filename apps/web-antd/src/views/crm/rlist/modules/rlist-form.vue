<script setup lang="ts">
import type { CrmRListApi } from '#/api/crm/rlist';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getSimpleBusinessList, type CrmBusinessApi } from '#/api/crm/business';
import { createRList, getRList, updateRList } from '#/api/crm/rlist';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

defineOptions({ name: 'CrmRListForm' });

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<CrmRListApi.RList>();
const businessList = ref<CrmBusinessApi.Business[]>([]);

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['需求单'])
    : $t('ui.actionTitle.create', ['需求单']);
});

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  showDefaultActions: false,
  handleValuesChange: async (values, changedFields) => {
    if (!changedFields.includes('oppsId') || !values.oppsId) {
      return;
    }
    const opps = businessList.value.find((item) => item.id === values.oppsId);
    if (opps?.customerId) {
      await formApi.setValues({ customerId: opps.customerId });
    }
  },
});

function mapFileUrlsToList(fileUrls?: string[]) {
  return (fileUrls || []).map((url) => ({ rlistFileUrl: url }));
}

function mapFilesListToUrls(filesList?: CrmRListApi.RListFile[]) {
  return (filesList || []).map((item) => item.rlistFileUrl).filter(Boolean);
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const values = (await formApi.getValues()) as CrmRListApi.RList & {
      filesList?: string[];
    };
    const data: CrmRListApi.RList = {
      ...values,
      filesList: mapFileUrlsToList(values.filesList),
    };
    try {
      await (formData.value?.id ? updateRList(data) : createRList(data));
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }
    businessList.value = await getSimpleBusinessList();
    const data = modalApi.getData<CrmRListApi.RList>();
    if (!data || !data.id) {
      await formApi.resetForm();
      return;
    }
    modalApi.lock();
    try {
      formData.value = await getRList(data.id);
      await formApi.setValues({
        ...formData.value,
        filesList: mapFilesListToUrls(formData.value.filesList),
      });
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-1/2">
    <Form class="mx-4" />
  </Modal>
</template>
