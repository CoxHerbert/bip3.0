import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

const PHONE_REG =
  /^(?:1\d{10}|0\d{2,3}-?\d{7,8})(?:,(?:1\d{10}|0\d{2,3}-?\d{7,8}))*$/;
const EMAIL_REG = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;

/** 表单配置 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'contactsName',
      label: '联系人姓名',
      component: 'Input',
      rules: [
        { required: true, message: '请输入联系人姓名' },
        {
          min: 1,
          max: 50,
          message: '联系人姓名长度需在 1-50 个字符之间',
        },
      ],
      componentProps: {
        placeholder: '请输入真实姓名（支持中英文）',
      },
    },
    {
      fieldName: 'contactsPhoneNumber',
      label: '联系方式',
      component: 'Input',
      rules: [
        { required: true, message: '请输入联系方式' },
        {
          validator: async (_rule: any, value: string) => {
            if (!value || PHONE_REG.test(value)) {
              return;
            }
            throw new Error(
              '请输入正确手机号/座机号，多个号码请用英文逗号分隔',
            );
          },
        },
      ],
      componentProps: {
        placeholder: '支持手机号/座机号，多个用英文逗号分隔',
      },
    },
    {
      fieldName: 'customerId',
      label: '关联客户 ID',
      component: 'InputNumber',
      rules: 'required',
      componentProps: {
        class: 'w-full',
        min: 1,
        precision: 0,
        placeholder: '请输入客户 ID（必填）',
      },
    },
    {
      fieldName: 'contactsEmail',
      label: '联系人邮箱',
      component: 'Input',
      rules: [
        {
          validator: async (_rule: any, value: string) => {
            if (!value || EMAIL_REG.test(value)) {
              return;
            }
            throw new Error('邮箱格式不正确，例如 xxx@xxx.com');
          },
        },
      ],
      componentProps: {
        placeholder: '请输入邮箱（可选）',
      },
    },
    {
      fieldName: 'contactsDeptName',
      label: '部门',
      component: 'Input',
      componentProps: { placeholder: '请输入部门（可选）' },
    },
    {
      fieldName: 'contactsPost',
      label: '职务',
      component: 'Input',
      componentProps: { placeholder: '请输入职务（可选）' },
    },
    {
      fieldName: 'contactsSuperiorId',
      label: '联系人上级 ID',
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
        precision: 0,
        placeholder: '请输入上级联系人 ID（可选）',
      },
    },
    {
      fieldName: 'contactsRole',
      label: '角色',
      component: 'Input',
      componentProps: { placeholder: '如：决策人 / 对接人 / 技术评估人' },
    },
    {
      fieldName: 'contactsLabel',
      label: '联系人标签',
      component: 'Input',
      componentProps: { placeholder: '多个标签用英文逗号分隔' },
    },
    {
      fieldName: 'familiarityLevelCode',
      label: '熟悉程度',
      component: 'Select',
      componentProps: {
        placeholder: '请选择熟悉程度（可选）',
        options: [
          { label: '1 - 陌生', value: '1' },
          { label: '2 - 熟悉', value: '2' },
          { label: '3 - 非常熟悉', value: '3' },
        ],
      },
    },
    {
      fieldName: 'contactsTabooItem',
      label: '忌讳事项',
      component: 'Textarea',
      componentProps: { placeholder: '请输入忌讳事项（可选）', rows: 2 },
    },
    {
      fieldName: 'salesStrategy',
      label: '销售策略',
      component: 'Textarea',
      componentProps: { placeholder: '请输入跟进策略（可选）', rows: 3 },
    },
  ];
}

/** 列表查询 */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'contactsName',
      label: '联系人姓名',
      component: 'Input',
      componentProps: { placeholder: '请输入联系人姓名', allowClear: true },
    },
    {
      fieldName: 'contactsPhoneNumber',
      label: '联系方式',
      component: 'Input',
      componentProps: { placeholder: '请输入联系方式', allowClear: true },
    },
    {
      fieldName: 'contactsEmail',
      label: '联系人邮箱',
      component: 'Input',
      componentProps: { placeholder: '请输入联系人邮箱', allowClear: true },
    },
    {
      fieldName: 'customerId',
      label: '关联客户 ID',
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
        precision: 0,
        placeholder: '请输入客户 ID',
      },
    },
  ];
}

/** 列字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'contactsName',
      title: '联系人姓名',
      minWidth: 160,
      fixed: 'left',
      slots: { default: 'contactsName' },
    },
    { field: 'contactsPhoneNumber', title: '联系方式', minWidth: 170 },
    { field: 'contactsEmail', title: '联系人邮箱', minWidth: 180 },
    { field: 'contactsDeptName', title: '部门', minWidth: 120 },
    { field: 'contactsPost', title: '职务', minWidth: 120 },
    { field: 'contactsRole', title: '角色', minWidth: 120 },
    { field: 'contactsLabel', title: '联系人标签', minWidth: 160 },
    { field: 'customerId', title: '关联客户 ID', minWidth: 120 },
    { field: 'contactsSuperiorId', title: '上级 ID', minWidth: 100 },
    { field: 'familiarityLevelCode', title: '熟悉程度', minWidth: 100 },
    { field: 'contactsTabooItem', title: '忌讳事项', minWidth: 160 },
    { field: 'salesStrategy', title: '销售策略', minWidth: 180 },
    {
      field: 'createTime',
      title: '创建时间',
      minWidth: 180,
      formatter: ({ cellValue }: any) =>
        cellValue ? new Date(cellValue).toLocaleString() : '-',
    },
    {
      title: '操作',
      field: 'actions',
      fixed: 'right',
      width: 160,
      slots: { default: 'actions' },
    },
  ];
}
