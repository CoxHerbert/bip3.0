const options = pageMode => {
  return {
    columns: [
      {
        name: '基本信息',
        classList: 'form-basic-group',
        renderType: 'form',
        showToggleExpand: true,
        prop: 'basic',
        items: [
          {
            prop: 'nameplateBatchType',
            label: '批次类型',
            type: 'select',
            width: 100,
            required: true,
            props: {
              disabled: false,
            },
            options: [
              {
                value: 'type1',
                label: '新增打印(流水递增)',
              },
              // {
              //   value: 'type2',
              //   label: '新增打印(流水不变)',
              // },
              {
                value: 'type3',
                label: '补打(流水不校验)',
              },
            ],
          },

          // {
          //   prop: 'customerName',
          //   label: '客户名称',
          //   value: 'customerName',
          //   required: true,
          //   type: 'wf-select-dialog',
          //   props: {
          //     objectName: 'customer',
          //   },
          // },
          {
            prop: 'nameplateTypeNameB',
            value: 'nameplateTypeNameB',
            label: '铭牌模版名称',
            width: 200,
            required: true,
            type: 'wf-select-dialog',
            props: {
              objectName: 'nameplateCustomer',
            },
          },
          {
            prop: 'nameplateTemplateType',
            label: '铭牌分类',
            type: 'dict',
            dictKey: 'DC_NAMEPLATE_TYPE',
            labelKey: 'label',
            required: true,
            valueKey: 'dictKey',
            props: {
              disabled: true,
            },
          },
          {
            prop: 'nameplateSize',
            label: '铭牌大小',
            type: 'dict',
            dictKey: 'DC_NAMEPLATE_SIZE',
            labelKey: 'label',
            required: true,
            valueKey: 'dictKey',
            props: {
              disabled: true,
            },
          },

          {
            prop: 'lookQtCode',
            label: '显示铭牌二维码',
            type: 'switch',

            props: {
              disabled: false,
            },
          },
        ],
      },
      {
        name: '铭牌详情',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'nameplateBatchRestructuringDetailsDataVoList',
        items: [
          {
            prop: 'nameplateTemplateDetailsType',
            label: '常量分类',
            type: 'dict',
            dictKey: 'DC_NAMEPLATE_TYPE_PARAMETER',
            labelKey: 'label',
            required: true,
            width: 120,
            valueKey: 'dictKey',
            props: {
              // disabled: true,
            },
          },
          // {
          //   prop: 'nameplateTemplateDetailsType',
          //   type: 'common',
          //   label: '模版分类',
          //   minWidth: '140px',
          //   is: 'el-input',
          //   props: {
          //     disabled: false,
          //     placeholder: '模版分类',
          //   },
          // },
          // {
          //   prop: 'nameplateTemplateDetailsColumn',
          //   type: 'input',
          //   label: '栏位',
          //   minWidth: '140px',
          //   is: 'el-input',
          //   props: {
          //     disabled: false,
          //     placeholder: '栏位',
          //   },
          // },
          {
            label: '排序',
            prop: 'nameplateTemplateDetailsSort',
            width: '90px',
            type: 'number',
            props: {
              disabled: false,
              placeholder: '排序',
              controlsPosition: 'right',
              min: 0,
            },
          },
          {
            prop: 'nameplateTemplateDetailsName',
            width: '180px',
            type: 'input',
            is: 'el-input',
            label: '名称',
            props: {
              disabled: false,
              placeholder: '名称',
            },
          },

          // {
          //   prop: 'nameplateTemplateDetailsVariableExpression',
          //   minWidth: '120px',
          //   type: 'dict',
          //   dictKey: 'DC_NAMEPLATE_EXPRESSION',
          //   labelKey: 'label',
          //   valueKey: 'dictKey',
          //   // multiple: true,
          //   label: '变量表达式',
          //   props: {
          //     disabled: false,
          //     placeholder: '变量表达式',
          //   },
          // },
          {
            label: '默认值',
            prop: 'nameplateTemplateDetailsDefaultValue',
            // width: '120px',
            type: 'input',
            props: {
              disabled: false,
              placeholder: '默认值',
            },
          },
          // {
          //   label: 'isSN',
          //   prop: 'nameplateTemplateDetailsIsSn',
          //   minWidth: '90px',
          //   // type: 'input',
          //   type: 'checkbox',

          //   props: {
          //     disabled: false,
          //     placeholder: 'isSN',
          //   },
          // },

          {
            type: 'actions',
            label: '操作',
            fixed: 'right',
            width: '120px',
            align: 'center',
            children: [
              {
                label: '删除',
                action: 'delete',
                showFunc: scope => {
                  return true; // 始终显示删除按钮
                },
              },
            ],
          },
        ],
      },
      {
        name: '流程信息',
        classList: 'form-detail-group',
        renderType: 'table',
        showToggleExpand: false,
        prop: 'nameplateBatchRestructuringFlowsDataVoList',
        items: [
          // {
          //   type: 'selection',
          //   fixed: 'left',
          //   width: '55',
          // },
          // {
          //   type: 'index',
          //   prod: 'dataIndex',
          //   fixed: 'left',
          //   width: '55',
          // },
          // {
          //   prop: 'projectNumber',
          //   type: 'common',
          //   label: '专案号',
          //   minWidth: '140px',
          //   is: 'el-input',
          //   props: {
          //     disabled: false,
          //     placeholder: '专案号',
          //   },
          // },

          {
            prop: 'projectNumber',
            label: '专案号',
            width: 200,
            required: true,
            type: 'wf-select-single',
            props: {
              objectName: 'CompleteMtoNo',
            },
          },
          {
            prop: 'printPersonId',
            label: '打印人',
            required: true,
            minWidth: '150px',
            type: 'wf-select-dialog',
            props: {
              objectName: 'user',
            },
          },

          {
            prop: 'receivePersonId',
            label: '接收人',
            minWidth: '150px',
            required: true,
            type: 'wf-select-dialog',
            props: {
              objectName: 'user',
            },
          },

          {
            prop: 'customerId',
            label: '客户名称',
            minWidth: '150px',
            required: true,
            type: 'wf-select-dialog',
            props: {
              objectName: 'customer',
            },
          },
          {
            prop: 'deliveryDate',
            width: '120px',
            type: 'common',
            is: 'el-date-picker',
            label: '交货日期',

            props: {
              disabled: false,
              placeholder: '交货日期',
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
            },
          },
          {
            label: '开始序号',
            prop: 'startSerialNumber',
            minWidth: '120px',
            type: 'number',
            required: true,
            props: {
              disabled: false,
              placeholder: '开始序号',
              controlsPosition: 'right',

              min: 1,
            },
          },
          {
            label: '打印数量',
            prop: 'printCount',
            minWidth: '120px',
            type: 'number',
            required: true,
            props: {
              disabled: false,
              placeholder: '打印数量',
              controlsPosition: 'right',
              min: 0,
            },
          },
          {
            label: '位数',
            prop: 'digitCount',
            minWidth: '120px',
            type: 'number',
            required: true,
            props: {
              disabled: false,
              placeholder: '位数',
              controlsPosition: 'right',
              min: 0,
            },
          },
          {
            label: '结束序号',
            prop: 'endSerialNumber',
            minWidth: '100px',
            type: 'input-number',
            props: {
              disabled: false,
              placeholder: '结束序号',
              min: 0,
            },
          },
          {
            label: '二维码',
            prop: 'qrCode',
            minWidth: '150px',
            type: 'input-number',
            props: {
              disabled: false,
              placeholder: '二维码',
            },
          },
          {
            prop: 'materialCode',
            type: 'common',
            label: '物料编码',
            minWidth: '140px',
            // is: 'text',
            props: {
              disabled: true,
              placeholder: '物料编码',
            },
          },
          {
            prop: 'materialName',
            minWidth: '120px',
            type: 'common',
            // is: 'text',
            label: '物料名称',
            props: {
              disabled: false,
              placeholder: '物料名称',
            },
          },
          // {
          //   label: '打印人id',
          //   prop: 'printPersonId',
          //   width: '100px',
          //   type: 'input-number',
          //   props: {
          //     disabled: false,
          //     placeholder: '打印人id',
          //     min: 0,
          //   },
          // },

          // {
          //   label: '文件',
          //   prop: 'fileUrl',
          //   minWidth: '200px',
          //   type: 'input',
          //   props: {
          //     disabled: false,
          //     placeholder: '文件',
          //   },
          // },
          {
            type: 'actions',
            label: '操作',
            fixed: 'right',
            width: '120px',
            align: 'center',
            children: [
              {
                label: '删除',
                action: 'delete',
                showFunc: scope => {
                  return true; // 始终显示删除按钮
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

export default options;
