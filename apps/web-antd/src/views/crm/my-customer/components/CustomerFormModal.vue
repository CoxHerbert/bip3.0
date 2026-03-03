<script lang="ts" setup>
import type { CrmCustomerApi } from '#/api/crm/my-customer';

import { computed, ref } from 'vue';

import { useVbenForm, useVbenModal } from '@vben/common-ui';

import { Modal as AntModal, message } from 'ant-design-vue';

import {
  createCustomer,
  getCustomer,
  submitCustomer,
  updateCustomer,
} from '#/api/crm/my-customer';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);

const formData = ref<CrmCustomerApi.Customer>();

const isApproved = computed(() => formData.value?.createStatus === 'APPROVED');

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['客户'])
    : $t('ui.actionTitle.create', ['客户']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: useFormSchema({
    isApproved: () => isApproved.value,
  }),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock();
    try {
      const data = (await formApi.getValues()) as CrmCustomerApi.Customer;

      // 兼容字段：customerCode 默认跟 code 一致
      if (data.code && !data.customerCode) data.customerCode = data.code;

      // 已审核禁止直接修改（前端兜底，后端也要兜底）
      if (formData.value?.createStatus === 'APPROVED') {
        message.warning('已审核的客户不可直接修改，请走变更流程');
        return;
      }

      await (formData.value?.id ? updateCustomer(data) : createCustomer(data));
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } catch (error: any) {
      // 唯一性冲突：建议后端返回 409
      if (error?.response?.status === 409) {
        message.error('该客户已存在');
        return;
      }
      throw error;
    } finally {
      modalApi.unlock();
    }
  },

  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      await formApi.resetForm();
      return;
    }

    const data = modalApi.getData<{ id?: number }>();
    if (!data?.id) {
      // 新建：默认草稿
      formData.value = { createStatus: 'DRAFT' } as any;
      await formApi.setValues({ createStatus: 'DRAFT' } as any);
      return;
    }

    modalApi.lock();
    try {
      formData.value = await getCustomer(data.id);
      await formApi.setValues(formData.value as any);
    } finally {
      modalApi.unlock();
    }
  },
});

// 可选：提交审核（减法版也可以删掉按钮）
async function onSubmitAudit() {
  if (!formData.value?.id) {
    message.warning('请先保存草稿再提交审核');
    return;
  }
  if (formData.value.createStatus === 'APPROVED') {
    message.warning('已审核客户不可重复提交');
    return;
  }

  const { valid } = await formApi.validate();
  if (!valid) return;

  AntModal.confirm({
    title: '提交审核',
    content: '提交后将进入审核流程，确认提交？',
    async onOk() {
      modalApi.lock();
      try {
        await submitCustomer(formData.value!.id!);
        message.success('提交成功');
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.unlock();
      }
    },
  });
}
</script>

<template>
  <Modal :title="getTitle" class="w-3/5">
    <div class="mx-4">
      <div
        v-if="isApproved"
        class="mb-3 rounded bg-yellow-50 p-2 text-yellow-700"
      >
        已审核的客户信息不可直接修改，请走变更流程
      </div>

      <Form />

      <div class="mt-4 flex justify-end gap-2">
        <a-button
          v-if="formData?.id"
          type="primary"
          @click="onSubmitAudit"
          :disabled="isApproved"
        >
          提交审核
        </a-button>
      </div>
    </div>
  </Modal>
</template>
