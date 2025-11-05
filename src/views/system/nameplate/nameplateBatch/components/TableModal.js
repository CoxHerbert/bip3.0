/** 线材执行单 */
const options = () => {
  return {
    columns: [
      // {
      //   label: '序号',
      //   type: 'index',
      //   width: 60,
      //   align: 'center',
      // },

      {
        prop: 'moNumber',
        value: 'moNumber',
        label: '专案号',
        required: true,
        type: 'rowText',
        width: 130,
        props: {
          disabled: true,
        },
      },

      {
        prop: 'customerName',
        label: '客户名称',
        value: 'customerName',
        required: true,
        type: 'wf-select-isdialog',
        props: {
          objectName: 'customer',
        },
        width: 150,
      },
      {
        prop: 'materialsCode',
        label: '料号',
        value: 'materialsCode',
        type: 'rowText',
        required: true,
        minWidth: 140,
      },
      {
        prop: 'materialName',
        value: 'materialName',
        label: '料名',
        required: true,
        type: 'rowText',
        width: 120,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'moTime',
        label: '交货日期',
        value: 'moTime',
        required: true,
        type: 'rowText',
        width: 120,
        props: {
          disabled: true,
        },
      },
      {
        prop: 'nameplateTypeNameB',
        value: 'nameplateTypeNameB',
        label: '模版名称',
        width: 200,
        required: true,
        type: 'wf-select-isdialog',
        props: {
          objectName: 'nameplateCustomer',
        },
      },
      {
        prop: 'nameplateTypeNameT',
        label: '铭牌分类',
        value: 'nameplateTypeNameT',
        type: 'dict',
        dictKey: 'DC_NAMEPLATE_TYPE',
        labelKey: 'label',
        required: true,
        valueKey: 'dictKey',
        width: 200,
        props: {
          width: 150,
        },
      },
      {
        prop: 'nameplateSizeNameT',
        value: 'nameplateSizeNameT',
        label: '铭牌大小',
        type: 'dict',
        dictKey: 'DC_NAMEPLATE_SIZE',
        labelKey: 'label',
        required: true,
        valueKey: 'dictKey',
        width: 200,
        props: {
          width: 150,
        },
      },
      {
        prop: 'assemblerName',
        value: 'assemblerName',
        label: '接收人',
        width: 200,
        required: true,
        type: 'wf-select-isdialog',
        props: {
          objectName: 'user',
        },
      },
      {
        prop: 'printerName',
        label: '打印人',
        value: 'printerName',
        type: 'wf-select-isdialog',
        width: 200,
        required: true,
        props: {
          objectName: 'user',
        },
      },
      // {
      //   prop: 'beginNumber',
      //   label: '开始序号',
      //   value: 'beginNumber',
      //   type: 'rowText',
      // },
      {
        prop: 'printerCount',
        label: '打印数量',
        required: true,
        value: 'printerCount',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'printerDigits',
        label: '位数',
        required: true,
        value: 'printerDigits',
        type: 'rowText',
        props: {
          disabled: true,
        },
      },
      {
        prop: 'fiels',
        label: '文件',
        required: true,
        value: 'fiels',
        type: 'rowText',
      },
      {
        prop: 'isJy',
        label: '是否校验',
        // required: true,
        value: 'isJy',
        type: 'rowText',
      },

      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 150,
        children: [
          // {
          //   type: 'button',
          //   label: '编辑',
          //   action: 'edit',
          // },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
          },
        ],
      },
    ],
  };
};

export default options;
