/** 线材BOM */
const options = () => {
  return {
    columns: [
      // {
      //   type: 'selection',
      //   width: '55px',
      //   align: 'center',
      // },
      {
        prop: '',
        label: '序号',
        width: '80px',
        align: 'center',
        type: 'index',
        render(scope) {
          return scope.$index + 1;
        },
      },
      {
        prop: 'createUser',
        label: '创建人',
        type: 'dc-view',
        width: '120px',
        objectName: 'user',
        // search: true,
        // searchProps: {
        //   is: 'input',
        // },
      },
      {
        prop: 'createTime',
        label: '创建日期',
        type: 'rowText',
        width: '200px',
      },
      {
        prop: 'isDeleted',
        label: '巡检状态',
        width: '150px',
        type: 'rowText',
      },
      // {
      //   prop: 'auditStatus',
      //   label: '审核状态',
      //   type: 'rowText',
      // },
      {
        type: 'expand',
        label: '询价详情',
        width: '80px',
        align: 'center',
        children: [
          {
            prop: 'bomCode',
            label: '物料编码',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'bomName',
            label: '物料名称',
            width: '150px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'bomModel',
            label: '规格型号',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'bomCount',
            label: '需求数量',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'bomUnit',
            label: '单位',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'customer',
            label: '客户',
            width: '200px',
            align: 'center',
            type: 'dc-view',
            objectName: 'customer',
          },
          {
            prop: 'taxPrice',
            label: '含税价',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'explanation',
            label: '终端客户价',
            width: '130px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'dsnPeopleId',
            label: '处理人',
            // width: '110px',
            align: 'center',
            type: 'dc-view',
            objectName: 'user',
          },
        ],
      },
      // 添加 dcQtSonDetails 相关列

      // {
      //   prop: 'qtNeedDay',
      //   label: '询价天数',
      //   width: '100px',
      //   align: 'center',
      //   type: 'childRowText',
      // },
      // {
      //   prop: 'explanation',
      //   label: '说明',
      //   align: 'center',
      //   type: 'childRowText',
      //   showOverflowTooltip: true,
      // },
      {
        prop: 'dsnPeopleId',
        label: '处理人',
        type: 'childRowText',
        width: '120px',
        objectName: 'user',
        search: true,
        searchProps: {
          is: 'wf-select-dialog',
          objectName: 'user',
        },
      },
    ],
  };
};

export default options;
