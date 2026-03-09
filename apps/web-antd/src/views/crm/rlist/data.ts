import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { getCustomerSimpleList } from '#/api/crm/customer';
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
      label: '客户需求编码',
      component: 'Input',
      componentProps: {
        placeholder: '可不填，后端自动生成',
      },
    },
    {
      fieldName: 'customerId',
      label: '关联客户',
      component: 'ApiSelect',
      componentProps: {
        api: getCustomerSimpleList,
        labelField: 'name',
        valueField: 'id',
        placeholder: '请选择关联客户',
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
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
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
    { field: 'rlistName', title: '需求名称', minWidth: 180 },
    { field: 'rlistCode', title: '客户需求编码', minWidth: 150 },
    { field: 'customerName', title: '关联客户', minWidth: 180 },
    { field: 'deviceKey', title: '设备类型', minWidth: 120 },
    { field: 'deviceTypeKey', title: '设备种类', minWidth: 120 },
    { field: 'creator', title: '创建人', minWidth: 120 },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 180,
      formatter: 'formatDateTime',
    },
    { field: 'remark', title: '备注', minWidth: 220, showOverflow: 'tooltip' },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
