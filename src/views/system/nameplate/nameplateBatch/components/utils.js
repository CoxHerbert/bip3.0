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
            prop: 'nameplateTemplateId',
            label: '铭牌模版id',
            type: 'input',
            width: 100,
            props: {
              disabled: false,
            },
          },
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
            prop: 'customerId',
            label: '客户id',
            type: 'input',
            width: 100,
            props: {
              disabled: false,
            },
          },
          {
            prop: 'customerName',
            label: '客户名称',
            value: 'customerName',
            required: true,
            type: 'wf-select-dialog',
            props: {
              objectName: 'customer',
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
            label: '铭牌分类',
            type: 'dict',
            dictKey: 'DC_NAMEPLATE_TYPE_PARAMETER',
            labelKey: 'label',
            required: true,
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
          {
            prop: 'nameplateTemplateDetailsColumn',
            type: 'common',
            label: '栏位',
            minWidth: '140px',
            is: 'el-input',
            props: {
              disabled: false,
              placeholder: '栏位',
            },
          },
          {
            prop: 'nameplateTemplateDetailsName',
            minWidth: '120px',
            type: 'common',
            is: 'el-input',
            label: '名称',
            props: {
              disabled: false,
              placeholder: '名称',
            },
          },
          {
            prop: 'nameplateTemplateDetailsVariableExpression',
            width: '120px',
            type: 'common',
            is: 'el-input',
            label: '变量表达式',
            props: {
              disabled: false,
              placeholder: '变量表达式',
            },
          },
          {
            label: '默认值',
            prop: 'nameplateTemplateDetailsDefaultValue',
            width: '120px',
            type: 'input',
            props: {
              disabled: false,
              placeholder: '默认值',
            },
          },
          // {
          //   label: '最终值',
          //   prop: 'nameplateTemplateDetailsFinalValue',
          //   minWidth: '120px',
          //   type: 'input',
          //   props: {
          //     disabled: false,
          //     placeholder: '最终值',
          //   },
          // },
          {
            label: '排序',
            prop: 'nameplateTemplateDetailsSort',
            minWidth: '80px',
            type: 'input-number',
            props: {
              disabled: false,
              placeholder: '排序',
              min: 0,
            },
          },
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
            type: 'wf-select-dialog',
            props: {
              objectName: 'deliveredItem',
            },
          },
          {
            prop: 'materialCode',
            type: 'common',
            label: '物料编码',
            minWidth: '140px',
            is: 'el-text',
            props: {
              disabled: false,
              placeholder: '物料编码',
            },
          },
          {
            prop: 'materialName',
            minWidth: '120px',
            type: 'common',
            is: 'el-text',
            label: '物料名称',
            props: {
              disabled: false,
              placeholder: '物料名称',
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
            width: '100px',
            type: 'number',

            props: {
              disabled: false,
              placeholder: '开始序号',
              min: 0,
            },
          },
          {
            label: '打印数量',
            prop: 'printCount',
            width: '100px',
            type: 'number',
            props: {
              disabled: false,
              placeholder: '打印数量',
              min: 0,
            },
          },
          {
            label: '位数',
            prop: 'digitCount',
            width: '80px',
            type: 'number',
            props: {
              disabled: false,
              placeholder: '位数',
              min: 0,
            },
          },
          {
            label: '结束序号',
            prop: 'endSerialNumber',
            width: '100px',
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
            minWidth: '120px',
            type: 'input',
            props: {
              disabled: false,
              placeholder: '二维码',
            },
          },
          {
            label: '打印人id',
            prop: 'printPersonId',
            width: '100px',
            type: 'input-number',
            props: {
              disabled: false,
              placeholder: '打印人id',
              min: 0,
            },
          },
          {
            label: '接收人id',
            prop: 'receivePersonId',
            width: '100px',
            type: 'input-number',
            props: {
              disabled: false,
              placeholder: '接收人id',
              min: 0,
            },
          },
          {
            label: '文件',
            prop: 'fileUrl',
            minWidth: '200px',
            type: 'input',
            props: {
              disabled: false,
              placeholder: '文件',
            },
          },
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
