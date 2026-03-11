import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

// import { useUserStore } from '@vben/stores';
// import { erpPriceMultiply } from '@vben/utils';
// import { z } from '#/adapter/form';
// import { getBusinessStatusTypeSimpleList } from '#/api/crm/business/status';
import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';
import { useUserStore } from '@vben/stores';

import { getCustomerSimpleList } from '#/api/crm/customer';
import { getSimpleUserList } from '#/api/system/user';
/** 新增/修改商机的表单 */
export function useFormSchema(): VbenFormSchema[] {
  const userStore = useUserStore();
  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'oppsName',
      label: '商机名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入商机名称',
      },
    },
    {
      fieldName: 'customerId',
      label: '客户名称',
      component: 'ApiSelect',
      componentProps: {
        api: getCustomerSimpleList,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择客户',
        allowClear: true,
        // 2. Ant Design Select 属性（透传生效）
        showSearch: true, // 启用搜索
        optionFilterProp: 'label', // 搜索字段
      },
      dependencies: {
        triggerFields: ['id'],
        disabled: (values) => values.customerDefault,
      },
      rules: 'required',
    },
    {
      fieldName: 'oppsCode',
      label: '商机编码',
      component: 'Input',
      componentProps: {
        placeholder: '自动生成，无需填写',
        disabled: true,
      },
    },
    {
      fieldName: 'fromId',
      label: '商机来源',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_FROM, 'number'),
        placeholder: '请选择商机来源',
      },
    },
    {
      fieldName: 'sectorId',
      label: '行业类别',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_PMS_PROJECT_INDUSTRY, 'number'),
        placeholder: '请选择行业类别',
      },
    },
    {
      fieldName: 'oppsLevelId',
      label: '商机级别',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_LEVEL, 'number'),
        placeholder: '请选择客户级别',
      },
    },
    {
      fieldName: 'personUser',
      label: '负责人',
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
        triggerFields: ['id'],
        show: (values) => !values.id, // ✅ 只有新增时（没有id）才显示
      },
    },
    // {
    //   fieldName: 'tpmUserId',
    //   label: 'TPM负责人',
    //   component: 'ApiSelect',
    //   componentProps: {
    //     api: getSimpleUserList,
    //     labelField: 'nickname',
    //     valueField: 'id',
    //     allowClear: true,
    //     // Ant Design Select 属性
    //     showSearch: true, // 启用搜索
    //     optionFilterProp: 'label', // 搜索字段
    //     // mode: 'multiple', // 多选模式
    //     placeholder: '请选择TPM负责人',
    //   },
    // },
    {
      fieldName: 'oppsStatusId',
      label: '商机状态',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_STATUS, 'number'),
        placeholder: '请选择商机状态',
      },
    },
    {
      fieldName: 'deptId',
      label: '所属部门',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_DEPARTMENT, 'number'),
        placeholder: '请选择所属部门',
      },
    },
    {
      fieldName: 'oppsOrgId',
      label: '所属组织',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_ORGANIZATION, 'string'),
        placeholder: '请选择所属组织',
      },
    },
    // 预估金额（元）
    {
      fieldName: 'expAmount',
      label: '预估金额（元）',
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入预估金额（元）',
      },
    },
    {
      fieldName: 'attachmentSaveReqVOS',
      label: '附件',
      component: 'FileUpload',
      formItemClass: 'col-span-2',
      componentProps: {
        maxNumber: 10,
        maxSize: 50,
        multiple: true,
        helpText: '支持上传图片、文档、压缩包，单个文件不超过50MB，最多10个',
        showDescription: true,
      },
      dependencies: {
        triggerFields: ['id'],
        show: (values) => !values.id, // 只有新增时（没有id）才显示
      },
    },

    {
      fieldName: 'oppsBackground',
      label: '商机背景',
      component: 'Textarea',
      formItemClass: 'col-span-2',
      componentProps: {
        placeholder: '请输入商机背景',
        rows: 3,
      },
    },

    // 团队成员 - 使用自定义组件
    {
      fieldName: 'permissionSaveReqVOS',
      label: '团队成员',
      component: 'Input', // 占位，实际用自定义渲染
      formItemClass: 'col-span-2',
      dependencies: {
        triggerFields: [''],
        show: () => false, // 默认隐藏，在 form.vue 中自定义渲染
      },
    },
  ];
}

/** 列表的搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'oppsLevelId',
      label: '商机级别',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_OPPS_LEVEL, 'number'),
        placeholder: '请选择商机级别',
        allowClear: true,
      },
    },
    {
      fieldName: 'oppsName',
      label: '商机名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入商机名称',
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'oppsStatusId',
      title: '商机状态',
      minWidth: 100,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_OPPS_STATUS },
      },
    },
    {
      field: 'oppsLevelId',
      title: '商机级别',
      minWidth: 100,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_OPPS_LEVEL },
      },
    },
    {
      field: 'oppsName',
      title: '商机名称',
      // fixed: 'left',
      minWidth: 160,
      slots: {
        default: 'oppsName',
      },
    },
    {
      field: 'oppsCode',
      title: '商机编码',
      minWidth: 140,
    },
    {
      field: 'customerName',
      title: '客户名称',
      minWidth: 160,
    },
    {
      field: 'fromId',
      title: '商机来源',
      minWidth: 100,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_OPPS_FROM },
      },
    },
    {
      field: 'sectorId',
      title: '行业类别',
      minWidth: 100,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_PMS_PROJECT_INDUSTRY },
      },
    },

    {
      field: 'bdUserName',
      title: 'BD负责人',
      minWidth: 100,
    },
    {
      field: 'tpmUserName',
      title: 'TPM负责人',
      minWidth: 100,
    },
    {
      field: 'expAmount',
      title: '预估金额(元)',
      minWidth: 100,
    },

    {
      field: 'deptId',
      title: '所属部门',
      minWidth: 130,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_OPPS_DEPARTMENT },
      },
    },
    {
      field: 'oppsOrgId',
      title: '所属组织',
      minWidth: 130,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_OPPS_ORGANIZATION },
      },
    },
    {
      field: 'createTime',
      title: '创建时间',
      formatter: 'formatDateTime',
      minWidth: 180,
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
