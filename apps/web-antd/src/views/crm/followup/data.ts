import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DescriptionItemSchema } from '#/components/description';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { useUserStore } from '@vben/stores';
import { formatDateTime } from '@vben/utils';

import { getBusinessPageByCustomer } from '#/api/crm/business';
import { getContactPageByCustomer } from '#/api/crm/contact';
import { BizTypeEnum } from '#/api/crm/permission';
import { getSimpleUserList } from '#/api/system/user';

/** 新增/修改的表单 */
export function useFormSchema(
  bizId: Ref<number | undefined>,
): VbenFormSchema[] {
  const userStore = useUserStore();
  return [
    {
      component: 'Input',
      fieldName: 'bizId',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      component: 'Input',
      fieldName: 'bizType',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'followUpUserId',
      label: '跟进人',
      component: 'ApiSelect',
      componentProps: {
        api: getSimpleUserList,
        labelField: 'nickname',
        valueField: 'id',
        allowClear: true,
        // 2. Ant Design Select 属性（透传生效）
        showSearch: true, // 启用搜索
        optionFilterProp: 'label', // 搜索字段
        placeholder: '请选择BD负责人',
      },
      defaultValue: userStore.userInfo?.id,
      dependencies: {
        triggerFields: ['bizType'], // 监听业务类型
        show: (values) => values.bizType === BizTypeEnum.CRM_BUSINESS, // 只有客户管理显示
      },
    },
    {
      fieldName: 'type',
      label: '跟进类型',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_FOLLOW_UP_TYPE, 'number'),
      },
      rules: 'required',
    },
    {
      fieldName: 'nextTime',
      label: '下次联系时间',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
        placeholder: '请选择下次联系时间',
      },
      rules: 'required',
    },
    {
      fieldName: 'content',
      label: '跟进内容',
      component: 'Textarea',
      rules: 'required',
    },
    {
      fieldName: 'picUrls',
      label: '图片',
      component: 'ImageUpload',
      dependencies: {
        triggerFields: ['bizType'], // 监听业务类型
        show: (values) => values.bizType === BizTypeEnum.CRM_CUSTOMER, // 只有客户管理显示
      },
    },
    {
      fieldName: 'fileUrls',
      label: '附件',
      component: 'FileUpload',
    },
    {
      fieldName: 'contactIds',
      label: '关联联系人',
      component: 'ApiSelect',
      componentProps: {
        api: async () => {
          if (!bizId.value) {
            return [];
          }
          const res = await getContactPageByCustomer({
            pageNo: 1,
            pageSize: 100,
            customerId: bizId.value,
          });
          return res.list;
        },
        labelField: 'name',
        valueField: 'id',
        mode: 'multiple',
      },
      dependencies: {
        triggerFields: ['bizType'], // 监听业务类型
        show: (values) => values.bizType === BizTypeEnum.CRM_CUSTOMER, // 只有客户管理显示
      },
    },
    {
      fieldName: 'businessIds',
      label: '关联商机',
      component: 'ApiSelect',
      componentProps: {
        api: async () => {
          if (!bizId.value) {
            return [];
          }
          const res = await getBusinessPageByCustomer({
            pageNo: 1,
            pageSize: 100,
            customerId: bizId.value,
          });
          return res.list;
        },
        labelField: 'name',
        valueField: 'id',
        mode: 'multiple',
      },
      dependencies: {
        triggerFields: ['bizType'], // 监听业务类型
        show: (values) => values.bizType === BizTypeEnum.CRM_CUSTOMER, // 只有客户管理显示
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(
  bizType: number,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'createTime',
      title: '创建时间',
      formatter: 'formatDateTime',
    },
    { field: 'creatorName', title: '跟进人' },
    {
      field: 'type',
      title: '跟进类型',
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_FOLLOW_UP_TYPE },
      },
    },
    { field: 'content', title: '跟进内容' },
    {
      field: 'nextTime',
      title: '下次联系时间',
      formatter: 'formatDateTime',
    },
    {
      field: 'contacts',
      title: '关联联系人',
      visible: bizType === BizTypeEnum.CRM_CUSTOMER,
      slots: { default: 'contacts' },
    },
    {
      field: 'businesses',
      title: '关联商机',
      visible: bizType === BizTypeEnum.CRM_CUSTOMER,
      slots: { default: 'businesses' },
    },
    {
      field: 'actions',
      title: '操作',
      slots: { default: 'actions' },
    },
  ];
}

/** 详情页的系统字段 */
export function useFollowUpDetailSchema(): DescriptionItemSchema[] {
  return [
    {
      field: 'creatorName',
      label: '负责人',
    },
    {
      field: 'content',
      label: '最近跟进内容',
    },
    {
      field: 'followUpRecordDOS', // ✅ 获取整个数组
      label: '最后跟进时间',
      render: (val) => {
        if (!val || !Array.isArray(val) || val.length === 0) {
          return '--';
        }
        const lastRecord = val[val.length - 1];
        return formatDateTime(lastRecord?.nextTime) as string;
      },
    },
    {
      field: 'followUpRecordDOS', // ✅ 获取整个数组
      label: '创建时间',
      render: (val) => {
        if (!val || !Array.isArray(val) || val.length === 0) {
          return '--';
        }
        const lastRecord = val[val.length - 1];
        return formatDateTime(lastRecord?.createTime) as string;
      },
    },
    {
      field: 'followUpRecordDOS', // ✅ 获取整个数组
      label: '更新时间',
      render: (val) => {
        if (!val || !Array.isArray(val) || val.length === 0) {
          return '--';
        }
        const lastRecord = val[val.length - 1];
        return formatDateTime(lastRecord?.updateTime) as string;
      },
    },
  ];
}
