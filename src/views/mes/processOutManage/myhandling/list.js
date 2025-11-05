const options = () => {
  return {
    columns: [
      { type: 'selection', width: 40, align: 'center' },
      {
        type: 'index',
        label: '序号',
        width: 60,
        align: 'center',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        label: '物料编号',
        prop: 'materialNumber',
        type: 'rowText',
        width: 160,
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '物料名称',
        prop: 'materialName',
        type: 'rowText',
        width: 180,
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '版本',
        prop: 'version',
        type: 'rowText',
        width: 80,
      },
      {
        label: '工艺单',
        prop: 'processNo',
        type: 'rowText',
        width: 160,
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '工艺列表',
        prop: 'processList',
        type: 'workOrderProgress',
        minWidth: 160,
      },
      {
        label: '专案号',
        prop: 'mtoNo',
        type: 'rowText',
        width: 120,
        search: true,
        searchProps: { is: 'input' },
      },
      {
        label: '计划数量',
        prop: 'plannedQty',
        type: 'rowText',
        width: 100,
      },
      {
        label: '备注',
        prop: 'remark',
        type: 'rowText',
        minWidth: 80,
      },
      {
        prop: 'options',
        width: 160,
        label: '操作',
        fixed: 'right',
        slot: '',
        type: 'actions',
      },
    ],
  };
};

export default options;
