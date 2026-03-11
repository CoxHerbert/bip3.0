<script lang="ts" setup>
import type { CrmBusinessOppApi } from '#/api/crm/businessopp';
// import type { CrmPermissionApi } from '#/api/crm/permission';

import { computed, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';
// import { useUserStore } from '@vben/stores';

import { Button, message, Select } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createBusinessOpp,
  getBusinessDetailOpp,
  updateBusinessOpp,
} from '#/api/crm/businessopp';
import { PermissionLevelEnum } from '#/api/crm/permission';
import { getSimpleUserList } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<CrmBusinessOppApi.BusinessOpp>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['商机'])
    : $t('ui.actionTitle.create', ['商机']);
});

// 用户选项列表
const userOptions = ref<{ label: string; value: number }[]>([]);

// 临时存储上传的文件信息（用于转换为 AttachmentSaveReqVO）
const uploadedFiles = ref<
  Array<{
    name: string;
    size: number;
    type: string;
    url: string;
  }>
>([]);

// 加载用户列表
async function loadUserOptions() {
  try {
    const res = await getSimpleUserList();
    userOptions.value = (res || []).map((user: any) => ({
      label: user.nickname,
      value: user.id,
    }));
  } catch (error) {
    console.error('加载用户列表失败:', error);
  }
}

// 组件挂载时加载
onMounted(() => {
  loadUserOptions();
  defaultTeamMembers();
});

// const userStore = useUserStore();
// 团队成员列表
const teamMembers = ref<
  { isDefault?: boolean; level: number; roleId?: number; userId?: number }[]
>([]);
function addTeamMember() {
  teamMembers.value.push({ level: PermissionLevelEnum.READ });
}
// 添加团队成员
function defaultTeamMembers() {
  const defaultTeamMembers: Array<{
    isDefault?: boolean;
    level: number;
    roleId?: number;
  }> = [
    {
      level: PermissionLevelEnum.READ,
      roleId: 1,
      isDefault: true,
    },
    {
      level: PermissionLevelEnum.READ,
      roleId: 2,
      isDefault: true,
    },
  ];
  teamMembers.value.push(...defaultTeamMembers);
}

// 删除团队成员
function removeTeamMember(index: number) {
  teamMembers.value.splice(index, 1);
}

// 角色选项
const roleOptions = getDictOptions(DICT_TYPE.CRM_ROLE_TYPE, 'number') as any;

// function handleUpdateProducts(products: any) {
//   formData.value = modalApi.getData<CrmBusinessApi.Business>();
//   formData.value!.products = products;
//   if (formData.value) {
//     const totalProductPrice =
//       formData.value.products?.reduce(
//         (prev, curr) => prev + curr.totalPrice,
//         0,
//       ) ?? 0;
//     const discountPercent = formData.value.discountPercent;
//     const discountPrice =
//       discountPercent === null
//         ? 0
//         : erpPriceMultiply(totalProductPrice, discountPercent / 100);
//     const totalPrice = totalProductPrice - (discountPrice ?? 0);
//     formData.value!.totalProductPrice = totalProductPrice;
//     formData.value!.totalPrice = totalPrice;
//     formApi.setValues(formData.value!);
//   }
// }

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 100,
  },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    try {
      // 提交表单
      const values = await formApi.getValues();
      const data = values as CrmBusinessOppApi.BusinessOpp;

      // 组装权限数据
      const permissions: CrmBusinessOppApi.PermissionSaveReqVO[] = [];

      // BD负责人作为商机负责人
      if (data.bdUserId) {
        permissions.push({
          userId: data.bdUserId,
          level: PermissionLevelEnum.READ,
          bizType: 4, // CRM_BUSINESS
        });
      }

      // 添加团队成员
      for (const member of teamMembers.value) {
        if (!member.roleId || !member.userId) {
          message.error('请完善团队成员信息（角色和人员必填）');
          modalApi.unlock();
          return;
        }
        permissions.push({
          userId: member.userId,
          level: member.level,
          bizType: 4,
          roleId: member.roleId,
        });
      }

      data.permissionSaveReqVOS = permissions;

      // 处理附件上传
      // FileUpload 组件返回的是文件URL数组（逗号分隔或数组）
      const attachmentUrls = values.attachmentSaveReqVOS;
      if (
        attachmentUrls &&
        typeof attachmentUrls === 'string' &&
        attachmentUrls.trim()
      ) {
        // 将URL转换为 AttachmentSaveReqVO[]
        const urls = attachmentUrls.split(',').filter((url) => url.trim());
        data.attachmentSaveReqVOS = urls.map((url) => {
          // 从URL中提取文件名
          const fileName = url.slice(Math.max(0, url.lastIndexOf('/') + 1));
          // 从 uploadedFiles 中查找对应的文件信息
          const fileInfo = uploadedFiles.value.find((f) => f.url === url);
          return {
            bizType: 4, // CRM_BUSINESS
            urlPath: url,
            fileName: fileInfo?.name || fileName,
            fileSize: fileInfo?.size,
            fileType: fileInfo?.type,
          };
        });
      } else if (Array.isArray(attachmentUrls) && attachmentUrls.length > 0) {
        // 如果是数组格式
        data.attachmentSaveReqVOS = attachmentUrls.map((url) => {
          const fileName = url.slice(Math.max(0, url.lastIndexOf('/') + 1));
          const fileInfo = uploadedFiles.value.find((f) => f.url === url);
          return {
            bizType: 4, // CRM_BUSINESS
            urlPath: url,
            fileName: fileInfo?.name || fileName,
            fileSize: fileInfo?.size,
            fileType: fileInfo?.type,
          };
        });
      } else {
        // 没有附件
        data.attachmentSaveReqVOS = [];
      }

      // 提交
      await (formData.value?.id
        ? updateBusinessOpp(data)
        : createBusinessOpp(data));

      // 清空临时文件
      uploadedFiles.value = [];

      // 关闭并提示
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
      teamMembers.value = [];
      uploadedFiles.value = [];
      return;
    }

    // 获取传入的数据
    const data = modalApi.getData<CrmBusinessOppApi.BusinessOpp>();

    modalApi.lock();
    try {
      if (data?.id) {
        // 编辑模式 - 加载详情
        formData.value = data.id
          ? await getBusinessDetailOpp(data.id)
          : data || ({} as CrmBusinessOppApi.BusinessOpp);
      } else {
        // 创建模式
        formData.value = data || ({} as CrmBusinessOppApi.BusinessOpp);
      }

      // 设置表单值
      await formApi.setValues(formData.value);

      // 回显附件
      if (formData.value.attachmentSaveReqVOS?.length) {
        // 保存文件信息
        uploadedFiles.value = formData.value.attachmentSaveReqVOS.map(
          (att) => ({
            url: att.urlPath,
            name:
              att.fileName ||
              att.urlPath.slice(Math.max(0, att.urlPath.lastIndexOf('/') + 1)),
            size: att.fileSize || 0,
            type: att.fileType || '',
          }),
        );
      }

      // 回显团队成员（排除 roleId 为 null 的负责人）
      // 回显团队成员时
      if (formData.value.permissionSaveReqVOS?.length) {
        // 先提取 roleId 1 和 2 的记录（标记为默认）
        const role1 = formData.value.permissionSaveReqVOS.find(
          (p) => p.roleId === 1,
        );
        const role2 = formData.value.permissionSaveReqVOS.find(
          (p) => p.roleId === 2,
        );

        // 构建默认成员列表
        const defaultMembers = [];
        if (role1) {
          defaultMembers.push({ ...role1, isDefault: true });
        } else {
          // 如果后端数据没有 roleId 1，补充一条
          defaultMembers.push({
            level: PermissionLevelEnum.READ,
            roleId: 1,
            isDefault: true,
          });
        }
        if (role2) {
          defaultMembers.push({ ...role2, isDefault: true });
        } else {
          // 如果后端数据没有 roleId 2，补充一条
          defaultMembers.push({
            level: PermissionLevelEnum.READ,
            roleId: 2,
            isDefault: true,
          });
        }

        // 提取其他成员（非默认）
        const otherMembers = formData.value.permissionSaveReqVOS
          .filter((p) => p.roleId !== null && p.roleId !== 1 && p.roleId !== 2)
          .map((p) => ({ ...p, isDefault: false }));

        // 合并：默认成员 + 其他成员
        teamMembers.value = [...defaultMembers, ...otherMembers];
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-2/5">
    <Form class="mx-4" />
    <!-- 团队成员 -->
    <div class="mx-4 mt-4 border-t pt-4">
      <div class="mb-3 text-base font-medium">团队成员</div>
      <div
        v-for="(member, index) in teamMembers"
        :key="index"
        class="mx-8 mb-3 flex items-center gap-3"
      >
        <Button
          type="link"
          danger
          class="px-2"
          v-if="!member.isDefault"
          @click="removeTeamMember(index)"
        >
          <IconifyIcon icon="lucide:trash-2" class="size-4" />
        </Button>
        <Button
          type="link"
          :disabled="member.isDefault"
          class="px-2"
          v-if="member.isDefault"
        >
          <IconifyIcon icon="lucide:trash-2" class="rgb(180 180 180) size-4" />
        </Button>
        <Select
          v-model:value="member.roleId"
          :options="roleOptions"
          placeholder="请选择角色 *"
          class="w-32"
          :disabled="member.isDefault"
          :status="!member.roleId ? 'error' : ''"
        />
        <Select
          v-model:value="member.userId"
          :options="userOptions"
          placeholder="请选择人员 *"
          class="flex-1"
          show-search
          option-filter-prop="label"
          :status="!member.userId ? 'error' : ''"
        />
      </div>
      <Button type="dashed" block class="mt-2" @click="addTeamMember">
        <IconifyIcon icon="lucide:plus" class="mr-1 size-4" />
        添加成员
      </Button>
    </div>
  </Modal>
</template>
