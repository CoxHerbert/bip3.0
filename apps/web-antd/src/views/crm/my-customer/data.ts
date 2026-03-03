import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

type SchemaCtx = {
  isApproved: () => boolean;
};

/** 减法：先用静态 options，后面再接字典 */
const OPTIONS = {
  createStatus: [
    { label: '草稿', value: 'DRAFT' },
    { label: '已提交', value: 'SUBMITTED' },
    { label: '已审核', value: 'APPROVED' },
  ],
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
};

/** 新增/修改的表单（减法版） */
export function useFormSchema(ctx: SchemaCtx): VbenFormSchema[] {
  const disabledAll = () => ctx.isApproved();

  return [
    {
      fieldName: 'id',
      component: 'Input',
      dependencies: { triggerFields: [''], show: () => false },
    },

    // A. 归属与流程
    {
      fieldName: 'createStatus',
      label: '创建状态',
      component: 'Select',
      componentProps: {
        options: OPTIONS.createStatus,
        placeholder: '创建状态',
        disabled: true,
      },
      defaultValue: 'DRAFT',
    },
    {
      fieldName: 'orgId',
      label: '所属组织编码',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '输入 orgId（减法版先用 Input）' },
    },
    {
      fieldName: 'orgName',
      label: '所属组织名称',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '输入 orgName（可选）' },
    },
    {
      fieldName: 'personInChargeUser',
      label: '负责人ID',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '输入负责人 userId（减法版）' },
    },
    {
      fieldName: 'sharerUser',
      label: '共享人',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '多个用逗号分隔，如：1001,1002' },
    },
    {
      fieldName: 'cusShareType',
      label: '共享等级',
      component: 'Select',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.cusShareType,
        placeholder: '请选择共享等级',
      },
    },

    // B. 基本工商信息
    {
      fieldName: 'fullname',
      label: '客户全称',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '企业工商注册完整名称（需唯一）' },
    },
    {
      fieldName: 'alias',
      label: '客户简称',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '如：XX科技' },
    },
    {
      fieldName: 'code',
      label: '客户编码（CRM）',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '必填且唯一（可后端自动生成）' },
    },
    {
      fieldName: 'customerCode',
      label: '客户编码（冗余）',
      component: 'Input',
      dependencies: {
        triggerFields: ['code', 'createStatus'],
        disabled: disabledAll,
      },
      componentProps: { placeholder: '默认与 code 一致（兼容历史）' },
    },
    {
      fieldName: 'taxNo',
      label: '社会信用代码',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '18位统一社会信用代码（需唯一）' },
    },
    {
      fieldName: 'legalPerson',
      label: '法人姓名',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '必填' },
    },
    {
      fieldName: 'legalPersonContact',
      label: '法人联系方式',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '手机号/座机（可选）' },
    },
    {
      fieldName: 'regType',
      label: '企业类型',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '如：有限责任公司' },
    },
    {
      fieldName: 'regCap',
      label: '注册资本',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '如：1000万人民币' },
    },
    {
      fieldName: 'runningStatus',
      label: '经营状态',
      component: 'Select',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.runningStatus,
        placeholder: '请选择经营状态',
      },
    },
    {
      fieldName: 'regDate',
      label: '注册时间',
      component: 'DatePicker',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择注册时间',
      },
    },
    {
      fieldName: 'cancelDate',
      label: '注销时间',
      component: 'DatePicker',
      dependencies: {
        triggerFields: ['runningStatus', 'createStatus'],
        disabled: disabledAll,
        required: (values) => values.runningStatus === '注销',
      },
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '经营状态为注销时必填',
      },
    },
    {
      fieldName: 'regAddress',
      label: '注册地址',
      component: 'Input',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '必填' },
    },
    {
      fieldName: 'regCode',
      label: '企业注册号',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },
    {
      fieldName: 'govBelong',
      label: '所属工商局',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },

    // C. 分类字典信息
    {
      fieldName: 'cusLevel',
      label: '客户等级',
      component: 'Select',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.cusLevel,
        placeholder: '请选择客户等级',
      },
    },
    {
      fieldName: 'cusCategory',
      label: '客户类别',
      component: 'Select',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.cusCategory,
        placeholder: '请选择客户类别',
      },
    },
    {
      fieldName: 'sector',
      label: '行业类别',
      component: 'Select',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.sector,
        placeholder: '请选择行业类别',
      },
    },
    {
      fieldName: 'staffSize',
      label: '人员规模',
      component: 'Select',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: {
        options: OPTIONS.staffSize,
        placeholder: '请选择人员规模',
      },
    },

    // D. 业务补充与附件
    {
      fieldName: 'companyScope',
      label: '经营范围',
      component: 'Textarea',
      rules: 'required',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '工商备案经营范围（必填）', rows: 3 },
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'customerDesc',
      label: '客户描述',
      component: 'Textarea',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '补充说明（可选）', rows: 3 },
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'website',
      label: '官网地址',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },
    {
      fieldName: 'bankOfDeposit',
      label: '开户银行',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },
    {
      fieldName: 'bankAccount',
      label: '银行账号',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },
    {
      fieldName: 'attachments',
      label: '相关附件',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '附件ID逗号分隔（至少包含营业执照页）' },
      formItemClass: 'col-span-2',
    },

    // CM
    {
      fieldName: 'isCm',
      label: '是否 CM 客户',
      component: 'Switch',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      defaultValue: false,
    },
    {
      fieldName: 'cmCode',
      label: 'CM 编码',
      component: 'Input',
      dependencies: {
        triggerFields: ['isCm', 'createStatus'],
        disabled: disabledAll,
        required: (values) => !!values.isCm,
        show: (values) => !!values.isCm,
      },
      componentProps: { placeholder: 'isCm=true 时必填' },
    },

    // ERP
    {
      fieldName: 'erpFid',
      label: 'ERP 唯一标识',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: 'ERP同步场景必填（减法版可不填）' },
    },
    {
      fieldName: 'erpFentryid',
      label: 'ERP 分录ID',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '可选' },
    },
    {
      fieldName: 'erpFnumber',
      label: 'ERP 编码',
      component: 'Input',
      dependencies: { triggerFields: ['createStatus'], disabled: disabledAll },
      componentProps: { placeholder: '需与 code 保持唯一（后端兜底）' },
    },
  ];
}

/** 列表的搜索表单（减法版） */
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'fullname',
      label: '客户全称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入客户全称',
        allowClear: true,
      },
    },
    {
      fieldName: 'cusLevel',
      label: '客户等级',
      component: 'Select',
      componentProps: {
        options: [
          { label: '核心客户', value: 1 },
          { label: '普通客户', value: 2 },
        ],
        placeholder: '请选择客户等级',
        allowClear: true,
      },
    },
  ];
}

/** 列表的字段（减法版） */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'fullname',
      title: '客户全称',
      fixed: 'left',
      minWidth: 260,
      slots: {
        default: 'fullname',
      },
    },
    { field: 'code', title: '客户编码', minWidth: 140 },
    { field: 'taxNo', title: '社会信用代码', minWidth: 180 },
    { field: 'cusLevel', title: '客户等级', minWidth: 120 },
    { field: 'cusCategory', title: '客户类别', minWidth: 120 },
    { field: 'orgId', title: '所属组织', minWidth: 140 },
    { field: 'personInChargeUser', title: '负责人ID', minWidth: 120 },
    { field: 'createStatus', title: '创建状态', minWidth: 120 },
    {
      field: 'updateTime',
      title: '更新时间',
      formatter: 'formatDateTime',
      minWidth: 180,
    },
    {
      field: 'createTime',
      title: '创建时间',
      formatter: 'formatDateTime',
      minWidth: 180,
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
