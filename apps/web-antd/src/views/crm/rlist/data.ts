import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { DICT_TYPE } from '@vben/constants';
import { getDictOptions } from '@vben/hooks';

import { getSimpleBusinessOppList } from '#/api/crm/businessopp';
import { getCustomerSimpleList } from '#/api/crm/customer';
import { getSimpleUserList } from '#/api/system/user';
import { getRangePickerDefaultProps } from '#/utils';

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
        placeholder: '系统自动生成',
        disabled: true,
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
        placeholder: '关联商机自动带出，可手动调整',
        showSearch: true,
        optionFilterProp: 'label',
      },
      rules: 'required',
    },
    {
      fieldName: 'oppsId',
      label: '关联商机',
      component: 'ApiSelect',
      componentProps: {
        api: getSimpleBusinessOppList,
        labelField: 'oppsName',
        valueField: 'id',
        placeholder: '请选择关联商机',
        showSearch: true,
        optionFilterProp: 'label',
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
        optionFilterProp: 'label',
      },
      rules: 'required',
    },
    {
      fieldName: 'deviceKey',
      label: '设备类型',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_RLIST_DEVICE),
        placeholder: '请选择设备类型',
      },
      rules: 'required',
    },
    {
      fieldName: 'deviceTypeKey',
      label: '设备种类',
      component: 'Select',
      componentProps: {
        options: getDictOptions(DICT_TYPE.CRM_RLIST_DEVICE_TYPE),
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
        multiple: true,
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
        optionFilterProp: 'label',
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
        options: getDictOptions(DICT_TYPE.CRM_RLIST_DEVICE_TYPE),
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
    { field: 'createName', title: '创建人', minWidth: 120 },
    { field: 'bdName', title: 'BD', minWidth: 120 },
    {
      field: 'deviceTypeKey',
      title: '设备种类',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_RLIST_DEVICE_TYPE },
      },
    },
    {
      field: 'deviceKey',
      title: '设备类型',
      minWidth: 120,
      cellRender: {
        name: 'CellDict',
        props: { type: DICT_TYPE.CRM_RLIST_DEVICE },
      },
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
