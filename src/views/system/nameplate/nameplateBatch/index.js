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
        type: 'selection',
        width: '55px',
        align: 'center',
        selectable(row) {
          return !row.isTransfer;
        },
      },
      {
        prop: 'moNumber',
        label: '专案号',
        type: 'rowText',
        width: 120,
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入专案号',
        },
      },

      {
        prop: 'taskName',
        label: '执行节点',
        type: 'rowText',
        width: 90,
      },
      {
        prop: 'createUser',
        label: '创建人',
        type: 'rowText',
        width: 100,
        search: true,
        objectName: 'user',
        searchProps: {
          is: 'wf-select-dialog',
          placeholder: '请选择创建人',
        },
      },
      {
        prop: 'taskUserName',
        label: '待执行人',
        type: 'rowText',
        width: 100,
        search: true,
        objectName: 'user',
        searchProps: {
          is: 'wf-select-dialog',
          placeholder: '请选择流程待执行人',
        },
      },

      // {
      //   prop: 'customerId',
      //   label: '流程带执行人',
      //   type: 'rowText',
      //   search: true,
      //   width: 150,
      //   searchProps: {
      //     is: 'input',
      //     placeholder: '流程带执行人',
      //   },
      // },

      {
        prop: 'materialsCode',
        label: '料号',
        type: 'rowText',

        search: true,
        width: 180,
        searchProps: {
          is: 'input',
          placeholder: '请输入专案号',
        },
      },
      {
        prop: 'qrCode',
        label: '二维码前缀',
        type: 'rowText',
        search: true,
        minWidth: 140,
        searchProps: {
          is: 'input',
          placeholder: '设备Id-智能盒子',
        },
      },
      {
        prop: 'beginNumber',
        label: '开始流水',
        type: 'rowText',
      },
      {
        prop: 'printerCount',
        label: '数量',
        type: 'rowText',
      },
      {
        prop: 'overNumber',
        label: '结束流水',
        type: 'rowText',
      },
      {
        prop: 'printerDigits',
        label: '位数',
        type: 'rowText',
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'rowText',
      },
      {
        prop: 'createTime',
        label: '登记时间',
        width: 200,
        type: 'rowText',
      },
      // {
      //   prop: 'assemblerName',
      //   label: '登记人',
      //   type: 'rowText',
      // },
      {
        prop: 'createUser',
        label: '登记人',
        width: 100,
        type: 'rowText',
        // props: {
        //   objectName: 'user',
        // },
      },
      // {
      //   prop: 'assemblerName',
      //   value: 'assemblerName',
      //   label: '登记人',
      //   width: 200,
      //   type: 'dc-view',
      //   objectName: 'user',
      //   // props: {
      //   //   objectName: 'user',
      //   // },
      // },

      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 150,
        children: [
          {
            type: 'button',
            label: '详情',
            action: 'detail',
          },
          // {
          //   type: 'button',
          //   label: '删除',
          //   action: 'delete',
          // },
        ],
      },
    ],
  };
};

export default options;
