import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { getSimpleBusinessList } from '#/api/crm/business';
import { getCustomerSimpleList } from '#/api/crm/customer';
import { getSimpleUserList } from '#/api/system/user';
import { getRangePickerDefaultProps } from '#/utils';

const DEVICE_CATEGORY_OPTIONS = [
  { label: '改机', value: 'REFIT' },
  { label: '备件', value: 'SPARE_PART' },
  { label: '整机', value: 'WHOLE_MACHINE' },
];

const DEVICE_TYPE_OPTIONS = [
  { label: '单机', value: 'SINGLE' },
  { label: '联机', value: 'LINKED' },
  { label: '产线', value: 'LINE' },
];

/** 新增/修改需求单表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'rlistName',
      label: '需求名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入需求名称',
      },
      rules: 'required',
    },
    {
      fieldName: 'rlistCode',
      label: '需求单编号',
      component: 'Input',
      componentProps: {
        placeholder: '可不填，后端自动生成',
      },
    },
    {
      fieldName: 'oppsId',
      label: '关联商机',
      component: 'ApiSelect',
      componentProps: {
        api: getSimpleBusinessList,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择关联商机',
        showSearch: true,
      },
      rules: 'required',
    },
    {
      fieldName: 'customerId',
      label: '关联客户',
      component: 'ApiSelect',
      componentProps: {
        api: getCustomerSimpleList,
        labelField: 'name',
        valueField: 'id',
        placeholder: '关联商机自动带出，可手动调整',
        showSearch: true,
      },
      rules: 'required',
    },
    {
      fieldName: 'bdId',
      label: 'BD',
      component: 'ApiSelect',
      componentProps: {
        api: getSimpleUserList,
        labelField: 'nickname',
        valueField: 'id',
        placeholder: '请选择 BD',
        showSearch: true,
      },
      rules: 'required',
    },
    {
      fieldName: 'deviceKey',
      label: '设备类型',
      component: 'Select',
      componentProps: {
        options: DEVICE_CATEGORY_OPTIONS,
        placeholder: '请选择设备类型',
      },
      rules: 'required',
    },
    {
      fieldName: 'deviceTypeKey',
      label: '设备种类',
      component: 'Select',
      componentProps: {
        options: DEVICE_TYPE_OPTIONS,
        placeholder: '请选择设备种类',
      },
      rules: 'required',
    },
    {
      fieldName: 'filesList',
      label: '相关附件',
      component: 'FileUpload',
      componentProps: {
        maxNumber: 9,
      },
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
  ];
}

/** 列表搜索表单 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'customerId',
      label: '关联客户',
      component: 'ApiSelect',
      componentProps: {
        api: getCustomerSimpleList,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择关联客户',
        allowClear: true,
        showSearch: true,
      },
    },
    {
      fieldName: 'rlistName',
      label: '需求名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入需求名称',
        allowClear: true,
      },
    },
    {
      fieldName: 'deviceTypeKey',
      label: '设备种类',
      component: 'Select',
      componentProps: {
        options: DEVICE_TYPE_OPTIONS,
        placeholder: '请选择设备种类',
        allowClear: true,
      },
    },
    {
      fieldName: 'createTime',
      label: '创建时间',
      component: 'RangePicker',
      componentProps: {
        ...getRangePickerDefaultProps(),
        allowClear: true,
      },
    },
  ];
}

/** 列表字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'seq', width: 60, title: '序号' },
    {
      field: 'rlistName',
      title: '需求名称',
      minWidth: 180,
      slots: { default: 'rlistName' },
    },
    { field: 'rlistCode', title: '需求单编号', minWidth: 150 },
    { field: 'customerName', title: '关联客户', minWidth: 180 },
    { field: 'oppsName', title: '关联商机', minWidth: 180 },
    { field: 'creator', title: '创建人', minWidth: 120 },
    { field: 'bdName', title: 'BD', minWidth: 120 },
    { field: 'deviceTypeKey', title: '设备种类', minWidth: 120 },
    { field: 'deviceKey', title: '设备类型', minWidth: 120 },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
