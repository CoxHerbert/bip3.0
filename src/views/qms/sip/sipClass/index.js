/** SIP类别管理页面 */
const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      {
        prop: 'moduleName',
        label: '模组名称',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 120,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入模组名称',
        },
      },
      {
        prop: 'checkType',
        label: '检验类型',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 120,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入检验类型',
        },
      },
      {
        prop: 'fileUrl',
        label: '附件(图片)',
        type: 'image',
        align: 'center',
        minWidth: 150,
      },
      {
        prop: 'inspectionItemName',
        label: '检查项名称',
        type: 'rowText',
        search: true,
        align: 'center',
        minWidth: 150,
        searchProps: {
          is: 'input',
          clearable: true,
          placeholder: '请输入检查项名称',
        },
      },
      {
        prop: 'method',
        label: '是否测量',
        type: 'dict',
        align: 'center',
        width: 100,
        dicData: [
          { label: '不测', value: 0 },
          { label: '测', value: 1 },
        ],
      },
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
            label: '修改',
            action: 'edit',
            permission(scope) {
              return {
                id: 'SIP_CLASS_EDIT',
                row: scope.row,
              };
            },
          },
          {
            type: 'button',
            label: '删除',
            action: 'delete',
            permission(scope) {
              return {
                id: 'SIP_CLASS_DELETE',
                row: scope.row,
              };
            },
          },
        ],
      },
    ],
  };
};

export default options;
