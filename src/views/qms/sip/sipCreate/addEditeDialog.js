/** 检验配置页面 */
const getAddEditColumns = () => {
  return [
    {
      prop: 'category',
      label: '类别',
      type: 'dict',
      dictKey: 'DC_INSPECTION_CLASS',
      labelKey: 'dictValue',
      valueKey: 'dictKey',
      required: true,
    },
    {
      prop: 'mtoNo',
      label: '专案号',
      type: 'wf-select-dialog',
      required: false,
      props: {
        objectName: 'CompleteMtoNo',
        masterKey: 'billNo',
        showKey: 'billNo',
        placeholder: '请选择专案',
        multiple: true,
      },
    },
    {
      prop: 'materialNumber',
      label: '物料',
      type: 'wf-select-dialog',
      required: false,
      props: {
        objectName: 'SnCheckMaterial',
        placeholder: '请选择物料',
        multiple: true,
        masterKey: 'fnumber',
        showKey: 'fnumber',
        query: {
          fuseorgid: 100006,
        },
      },
    },
    {
      prop: 'isConfig',
      label: '启动状态',
      type: 'el-select',
      align: 'center',
      required: true,
      props: {
        placeholder: '请选择启动状态',
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ],
      },
    },
  ];
};

const getImportColumns = () => {
  return [
    {
      prop: 'category',
      label: '类别',
      type: 'dict',
      dictKey: 'DC_INSPECTION_CLASS',
      labelKey: 'dictValue',
      valueKey: 'dictKey',
      required: true,
    },
    {
      prop: 'mtoNo',
      label: '专案号',
      type: 'wf-select-dialog',
      required: false,
      props: {
        objectName: 'CompleteMtoNo',
        masterKey: 'billNo',
        showKey: 'billNo',
        placeholder: '请选择专案',
        multiple: true,
      },
    },
    {
      prop: 'materialNumber',
      label: '物料',
      type: 'wf-select-dialog',
      required: false,
      props: {
        objectName: 'SnCheckMaterial',
        placeholder: '请选择物料',
        multiple: true,
        masterKey: 'fnumber',
        showKey: 'fnumber',
        showValue: false, // 不回显选中的值
        query: {
          fuseorgid: 100006,
        },
      },
    },
    {
      label: '上传附件',
      prop: 'file',
      type: 'el-upload',
      required: true,
    },
  ];
};

const options = (mode = 'addEdit') => {
  return {
    columns: mode === 'import' ? getImportColumns() : getAddEditColumns(),
  };
};

export default options;
