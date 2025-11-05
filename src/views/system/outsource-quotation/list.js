import dayjs from 'dayjs';

const options = () => {
  return {
    columns: [
      { prop: '', label: '序号', width: '60px', showColumn: true, align: 'center', type: 'index' },
      {
        label: '专案号',
        prop: 'mtono',
        search: true,
        type: 'input',
        width: 100,
        showColumn: true,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },

      {
        label: '采/生组织',
        prop: 'orgId',
        width: 120,
        showColumn: true,
        type: 'wf-select-dialog',
        props: {
          objectName: 'org',
        },
      },

      {
        label: '编码',
        prop: 'fnumber',
        search: true,
        type: 'input',
        showColumn: true,
        width: 120,
        props: {
          disabled: true,
        },
        searchProps: { is: 'input' },
      },
      {
        label: '名称',
        prop: 'materialName',
        search: false,
        showColumn: true,
        type: 'input',
        width: 180,
        props: {
          disabled: true,
        },
      },
      {
        label: '版本',
        prop: 'version',
        search: false,
        showColumn: true,
        type: 'input',
        width: 60,
        props: {
          disabled: true,
        },
      },
      {
        label: '源单',
        prop: 'srcBillNo',
        search: false,
        showColumn: true,
        width: 140,
        type: 'input',
        props: {
          disabled: true,
        },
      },
      {
        label: '下单日期',
        prop: 'approveDate',
        search: false,
        showColumn: true,
        type: 'input',
        width: 90,
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.approveDate)) return '-';
          return dayjs(scope.row.approveDate).format('YYYY-MM-DD');
        },
      },
      {
        label: '交期',
        prop: 'arrivalDate',
        search: false,
        type: 'input',
        width: 90,
        showColumn: true,
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.arrivalDate)) return '-';
          return dayjs(scope.row.arrivalDate).format('YYYY-MM-DD');
        },
      },
      {
        label: '更新时间',
        prop: 'updateTime',
        search: false,
        width: 90,
        type: 'input',
        props: {
          disabled: true,
        },
        showColumn: false,
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.updateTime)) return '-';
          return dayjs(scope.row.updateTime).format('YYYY-MM-DD');
        },
      },
      {
        label: '材料费',
        prop: 'materialFee',
        type: 'input',
        showColumn: false,
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.materialFee)) return '-';
          return Number(scope.row.materialFee).toFixed(2);
        },
      },
      {
        label: '加工费',
        prop: 'processFee',
        search: false,
        type: 'input',
        showColumn: false,
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.processFee)) return '-';
          return Number(scope.row.processFee).toFixed(2);
        },
      },
      {
        label: '表处费',
        prop: 'surfaceFee',
        search: false,
        showColumn: false,
        type: 'input',
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.surfaceFee)) return '-';
          return Number(scope.row.surfaceFee).toFixed(2);
        },
      },
      {
        label: '单件价格',
        prop: 'currentOutsourcePrice',
        search: false,
        showColumn: false,
        type: 'input',
        props: {
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.currentOutsourcePrice)) return '-';
          return Number(scope.row.currentOutsourcePrice).toFixed(2);
        },
      },
      {
        label: '数量',
        prop: 'qty',
        search: false,
        type: 'input',
        required: true,
        showColumn: true,
        props: {
          type: 'number',
          disabled: true,
        },
        transVal(scope) {
          if ([undefined, null, '', ' '].includes(scope.row.qty)) return '-';
          return Number(scope.row.qty).toFixed(0);
        },
      },
      {
        label: '材质',
        prop: 'erpSpecificationName',
        search: true,
        showColumn: true,
        type: 'input',
        searchProps: { is: 'input' },
        props: {
          disabled: true,
        },
      },

      {
        label: '状态',
        prop: 'quotationStatusId',
        search: true,
        type: 'dict',
        showColumn: true,
        dictKey: 'DC_WX_VALENCE_STATUS',
        required: true,
        width: 100,
        searchProps: { is: 'dict' },
        props: {
          disabled: true,
        },
      },

      {
        prop: 'options',
        minWidth: 140,
        label: '操作',
        fixed: 'right',
        showColumn: true,
        slot: '',
        type: 'actions',
        children: [
          {
            type: 'button',
            label: '去核价',
            action: 'pricingdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_WHJ';
            },
          },
          // {
          //   type: 'button',
          //   label: '去核价',
          //   action: 'pricingdetail',
          //   showFunc(scope) {
          //     return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_HB';
          //   },
          // },
          {
            type: 'button',
            label: '查看详情',
            action: 'lookdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
            },
          },
          {
            type: 'button',
            label: '编辑',
            action: 'lookEdit',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_YHJ';
            },
          },
          {
            type: 'button',
            label: '查看',
            action: 'lookBuhj',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_BHJ';
            },
          },

          {
            type: 'button',
            label: '查看详情',
            action: 'lookdetail',
            showFunc(scope) {
              return scope.row?.quotationStatusId === 'DC_WX_VALENCE_STATUS_BHJ' ? false : '';
            },
          },
        ],
      },
    ],
  };
};
export default options;
