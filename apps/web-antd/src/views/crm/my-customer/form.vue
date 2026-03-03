<script lang="ts" setup>
import type { CrmCustomerApi } from '#/api/crm/my-customer';
import type { SystemUserApi } from '#/api/system/user';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, useVbenForm, useVbenModal } from '@vben/common-ui';

import { Button, Divider, message, Modal, Popover, Tag } from 'ant-design-vue';

import {
  createCustomer,
  getCustomer,
  submitCustomer,
  updateCustomer,
} from '#/api/crm/my-customer';
import { UserSelectModal } from '#/components/select-modal';

type Mode = 'create' | 'update';
type SelectScene = 'owner' | 'sharer';

const route = useRoute();
const router = useRouter();

const id = computed(() => {
  const v = route.params.id;
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
});
const mode = computed<Mode>(() => (id.value ? 'update' : 'create'));

const loading = ref(false);
const formData = ref<CrmCustomerApi.Customer>({
  createStatus: 'DRAFT',
});

const modelData = defineModel<any>(); // 创建本地数据副本

const currentSelectType = ref<'manager' | 'start'>('start');

const isApproved = computed(() => formData.value?.createStatus === 'APPROVED');

const title = computed(() => {
  if (mode.value === 'create') return '新建客户';
  return '编辑客户';
});

/** ============ 人员选择器（替换 Input） ============ */
const selectScene = ref<SelectScene>('owner');
const selectedUsers = ref<any[]>([]);

const [UserSelectModalComp, userSelectModalApi] = useVbenModal({
  connectedComponent: UserSelectModal,
  destroyOnClose: true,
});

function openOwnerSelect() {
  selectScene.value = 'owner';
  const current = (formApi.getValues() as any)?.personInChargeUser;
  selectedUsers.value = current ? [{ id: current }] : [];
  userSelectModalApi.open();
}

/** 处理用户选择确认 */
function handleUserSelectConfirm(userList: SystemUserApi.User[]) {
  modelData.value =
    currentSelectType.value === 'start'
      ? {
          ...modelData.value,
          startUserIds: userList.map((u) => u.id),
        }
      : {
          ...modelData.value,
          managerUserIds: userList.map((u) => u.id),
        };
}

/** 用户选择弹窗关闭 */
function handleUserSelectClosed() {
  selectedUsers.value = [];
}

/** 用户选择弹窗取消 */
function handleUserSelectCancel() {
  selectedUsers.value = [];
}

function openSharerSelect() {
  selectScene.value = 'sharer';
  const current = (formApi.getValues() as any)?.sharerUser as
    | string
    | undefined;
  selectedUsers.value = current
    ? current
        .split(',')
        .filter(Boolean)
        .map((x) => ({ id: x }))
    : [];
  userSelectModalApi.open();
}

/** 减法：静态 options，后续接字典即可 */
const OPTIONS = {
  runningStatus: [
    { label: '存续', value: '存续' },
    { label: '注销', value: '注销' },
    { label: '吊销', value: '吊销' },
  ],
  cusLevel: [
    { label: '核心客户', value: 1 },
    { label: '普通客户', value: 2 },
  ],
  cusCategory: [
    { label: '终端客户', value: 1 },
    { label: '经销商', value: 2 },
  ],
  cusShareType: [
    { label: '私有', value: 1 },
    { label: '部门共享', value: 2 },
    { label: '全公司共享', value: 3 },
  ],
  sector: [
    { label: '制造业', value: 1 },
    { label: '服务业', value: 2 },
  ],
  staffSize: [
    { label: '1-10人以下', value: 1 },
    { label: '10-50人', value: 2 },
  ],
  createStatus: [
    { label: '草稿', value: 'DRAFT' },
    { label: '已提交', value: 'SUBMITTED' },
    { label: '已审核', value: 'APPROVED' },
  ],
};

const keyNames: Record<string, string> = {
  fullname: '客户全称',
  cusCategory: '客户分类',
  cusLevel: '客户级别',
  customerDesc: '客户描述',
  personInChargeUser: '负责人',
  isCm: '是否CM',
};

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  showDefaultActions: false,
  schema: [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: { triggerFields: [''], show: () => false },
    },

    // ========== 基本信息 ==========
    {
      fieldName: 'fullname',
      label: '客户全称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入企业名称（减法：不做自动补全）',
        allowClear: true,
      },
    },
    {
      fieldName: 'customerCode',
      label: '客户编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入（不允许中文/空格）',
        allowClear: true,
      },
    },
    {
      fieldName: 'legalPerson',
      label: '法定代表人',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'regCap',
      label: '注册资本',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'regType',
      label: '企业类型',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'taxNo',
      label: '社会信用代码',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入 18 位统一社会信用代码',
        allowClear: true,
      },
    },
    {
      fieldName: 'runningStatus',
      label: '经营状态',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: OPTIONS.runningStatus,
        placeholder: '请选择',
        allowClear: true,
      },
    },
    {
      fieldName: 'regCode',
      label: '企业注册号',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'regAddress',
      label: '注册地址',
      component: 'Input',
      rules: 'required',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'regDate',
      label: '成立日期',
      component: 'DatePicker',
      rules: 'required',
      componentProps: {
        format: 'YYYY/MM/DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择',
      },
    },
    {
      fieldName: 'cancelDate',
      label: '注销日期',
      component: 'DatePicker',
      dependencies: {
        triggerFields: ['runningStatus'],
        required: (values) => values.runningStatus === '注销',
        show: (values) => values.runningStatus === '注销',
      },
      componentProps: {
        format: 'YYYY/MM/DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '经营状态为注销时必填',
      },
    },
    {
      fieldName: 'govBelong',
      label: '所属工商局',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },

    {
      fieldName: 'companyScope',
      label: '经营范围',
      component: 'Textarea',
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: { placeholder: '请输入', rows: 3 },
    },

    // ========== 客户属性 ==========
    {
      fieldName: 'cusCategory',
      label: '客户分类',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: OPTIONS.cusCategory,
        placeholder: '请选择',
        allowClear: true,
      },
    },
    {
      fieldName: 'staffSize',
      label: '人员规模',
      component: 'Select',
      componentProps: {
        options: OPTIONS.staffSize,
        placeholder: '请选择',
        allowClear: true,
      },
    },
    {
      fieldName: 'cusLevel',
      label: '客户级别',
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: OPTIONS.cusLevel,
        placeholder: '请选择',
        allowClear: true,
      },
    },

    // ✅负责人：点击打开人员选择器
    {
      fieldName: 'personInChargeUser',
      label: '负责人',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请选择负责人',
        readonly: true,
        onClick: openOwnerSelect,
      },
    },

    {
      fieldName: 'cusShareType',
      label: '共享方式',
      component: 'Select',
      componentProps: {
        options: OPTIONS.cusShareType,
        placeholder: '请选择',
        allowClear: true,
      },
    },

    // ✅共享人：点击打开人员选择器（多选回填逗号分隔）
    {
      fieldName: 'sharerUser',
      label: '共享人',
      component: 'Input',
      componentProps: {
        placeholder: '请选择共享人（多选）',
        readonly: true,
        onClick: openSharerSelect,
      },
    },

    {
      fieldName: 'sector',
      label: '行业类别',
      component: 'Select',
      componentProps: {
        options: OPTIONS.sector,
        placeholder: '请选择',
        allowClear: true,
      },
    },
    {
      fieldName: 'customerDesc',
      label: '客户描述',
      component: 'Textarea',
      rules: 'required',
      formItemClass: 'col-span-2',
      componentProps: { placeholder: '请输入', rows: 3 },
    },

    // ========== 厂区属性（减法：先不做厂区明细表） ==========
    {
      fieldName: 'isCm',
      label: '是否为厂区',
      component: 'Switch',
      defaultValue: false,
    },
    {
      fieldName: 'cmCode',
      label: 'CM编码',
      component: 'Input',
      dependencies: {
        triggerFields: ['isCm'],
        show: (values) => !!values.isCm,
        required: (values) => !!values.isCm,
      },
      componentProps: { placeholder: 'isCm=true 时必填', allowClear: true },
    },

    // ========== 银行信息 ==========
    {
      fieldName: 'bankOfDeposit',
      label: '开户银行',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },
    {
      fieldName: 'bankAccount',
      label: '银行卡号',
      component: 'Input',
      componentProps: { placeholder: '请输入', allowClear: true },
    },

    // ========== 附件（减法：先用 input） ==========
    {
      fieldName: 'attachments',
      label: '相关附件',
      component: 'Input',
      formItemClass: 'col-span-2',
      componentProps: {
        placeholder: '附件ID逗号分隔（至少营业执照页）',
        allowClear: true,
      },
    },

    // ========== 流程状态（只读） ==========
    {
      fieldName: 'createStatus',
      label: '创建状态',
      component: 'Select',
      componentProps: { options: OPTIONS.createStatus, disabled: true },
      defaultValue: 'DRAFT',
    },
  ],
});

const unfilledItems = computed(() => {
  const values = formApi?.getValues?.() as any;
  if (!values) return [];
  return Object.keys(keyNames)
    .filter((k) => {
      const v = values[k];
      if (Array.isArray(v)) return v.length === 0;
      if (typeof v === 'string') return !v;
      if (v === undefined || v === null) return true;
      return false;
    })
    .map((k) => ({ key: k, keyName: keyNames[k] }));
});

async function loadDetail() {
  if (!id.value) {
    await formApi.setValues({ createStatus: 'DRAFT' } as any);
    return;
  }
  loading.value = true;
  try {
    const data = await getCustomer(id.value);
    formData.value = data as any;
    await formApi.setValues(data as any);
  } finally {
    loading.value = false;
  }
}

function goList() {
  router.push({ name: 'CrmCustomer' });
}
function goDetail() {
  if (!id.value) return;
  router.push({ name: 'CrmCustomerDetail', params: { id: id.value } });
}

async function handleSave() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  if (isApproved.value) {
    message.warning('已审核的客户不可直接修改，请走变更流程');
    return;
  }

  loading.value = true;
  try {
    const data = (await formApi.getValues()) as CrmCustomerApi.Customer;

    // customerCode 过滤：不允许中文/空格
    if (data.customerCode) {
      data.customerCode = data.customerCode.replaceAll(/[一-鿿\s]/g, '');
    }
    // 兼容字段
    if (data.code && !data.customerCode) data.customerCode = data.code;
    if (data.customerCode && !data.code) data.code = data.customerCode;

    if (mode.value === 'create') {
      const newId = await createCustomer({ ...data, createStatus: 'DRAFT' });
      message.success('保存成功');
      router.replace({ name: 'CrmCustomerUpdate', params: { id: newId } });
      return;
    }

    await updateCustomer(data);
    message.success('保存成功');
    await loadDetail();
  } catch (error: any) {
    if (error?.response?.status === 409) {
      message.error('该客户已存在');
      return;
    }
    if (error?.response?.status === 400) {
      message.error(
        '校验不通过：请检查必填项/业务规则（注销日期/附件/审核状态等）',
      );
      return;
    }
    throw error;
  } finally {
    loading.value = false;
  }
}

async function handleSaveDraft() {
  Modal.confirm({
    title: '存草稿',
    content: '确认存为草稿？（createStatus=DRAFT）',
    async onOk() {
      await formApi.setValues({ createStatus: 'DRAFT' } as any);
      await handleSave();
    },
  });
}

async function handleSubmitAudit() {
  if (!id.value) {
    message.warning('请先保存草稿再提交审核');
    return;
  }
  const { valid } = await formApi.validate();
  if (!valid) return;

  Modal.confirm({
    title: '提交审核',
    content: '提交后将进入审核流程，确认提交？（attachments 必填）',
    async onOk() {
      loading.value = true;
      try {
        await submitCustomer(id.value!);
        message.success('提交成功');
        await loadDetail();
      } catch (error: any) {
        if (error?.response?.status === 400) {
          message.error('提交失败：请检查附件/注销日期/审核状态等业务规则');
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    },
  });
}

onMounted(loadDetail);
</script>

<template>
  <Page auto-content-height>
    <div class="flex gap-4">
      <!-- 左侧：表单 -->
      <div class="flex-1 rounded bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-lg font-semibold">{{ title }}</div>
          <div class="flex items-center gap-2">
            <Tag v-if="formData?.createStatus" color="blue">
              {{ formData.createStatus }}
            </Tag>
            <Button @click="goList">返回列表</Button>
            <Button v-if="mode === 'update'" @click="goDetail">查看详情</Button>
          </div>
        </div>

        <Divider orientation="left">客户信息</Divider>
        <Form :disabled="loading || isApproved" />

        <div class="mt-4 flex justify-end gap-2">
          <Button @click="handleSaveDraft" :disabled="loading">存草稿</Button>
          <Button
            type="primary"
            @click="handleSave"
            :loading="loading"
            :disabled="isApproved"
          >
            {{ mode === 'create' ? '创建客户' : '保存客户' }}
          </Button>
          <Button
            type="primary"
            ghost
            @click="handleSubmitAudit"
            :disabled="loading || mode === 'create' || isApproved"
          >
            提交审核
          </Button>
        </div>

        <div
          v-if="isApproved"
          class="mt-3 rounded bg-yellow-50 p-2 text-yellow-700"
        >
          已审核客户信息不可直接修改，请走变更流程
        </div>
      </div>

      <!-- 右侧：摘要/未填项（减法版） -->
      <div class="w-[420px] rounded bg-white p-4">
        <div class="text-base font-semibold">摘要</div>
        <div class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">客户全称</span>
            <span class="max-w-[260px] truncate">{{
              formData.fullname || '-'
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">法定代表人</span>
            <span class="max-w-[260px] truncate">{{
              formData.legalPerson || '-'
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">经营状态</span>
            <span>{{ formData.runningStatus || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">社会信用代码</span>
            <span class="max-w-[260px] truncate">{{
              formData.taxNo || '-'
            }}</span>
          </div>
        </div>

        <Divider />

        <Popover trigger="click" placement="bottom">
          <template #content>
            <div class="w-[320px]">
              <div class="mb-2 font-medium">未完善项</div>
              <div v-if="unfilledItems.length === 0" class="text-gray-500">
                已完善
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="item in unfilledItems"
                  :key="item.key"
                  class="rounded bg-gray-50 p-2"
                >
                  <div class="font-medium">{{ item.keyName }}</div>
                  <div class="text-gray-500">信息为空，请填写</div>
                </div>
              </div>
            </div>
          </template>

          <Button danger class="mt-2 w-full">
            {{ unfilledItems.length }} 项不完善
          </Button>
        </Popover>

        <div class="mt-3 text-xs text-gray-500">
          说明：锚点定位/厂区明细/附件上传等高级能力后续可逐步加回。
        </div>
      </div>
    </div>

    <!-- 人员选择器 -->
    <UserSelectModalComp
      class="w-3/5"
      v-model:value="selectedUsers"
      :multiple="selectScene === 'sharer'"
      @confirm="handleUserSelectConfirm"
      @closed="handleUserSelectClosed"
      @cancel="handleUserSelectCancel"
    />
  </Page>
</template>
