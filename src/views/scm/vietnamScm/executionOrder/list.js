/** 线材执行单 */
const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
        fixed: 'left',
      },
      //   {
      //     label: '序号',
      //     type: 'index',
      //     width: 60,
      //     align: 'center',
      //   },
      {
        prop: 'billNo',
        label: '单据编号',
        type: 'clickable-text',
        fixed: 'left',
        width: '100px',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
      },
      // {
      //   prop: 'purchaseOrgName',
      //   label: '采购组织',
      //   type: 'input',

      //   minWidth: 140,

      // },
      {
        prop: 'taskName',
        label: '当前执行人',
        type: 'input',
      },
      {
        prop: 'taskUserName',
        label: '流程待执行人',
        type: 'input',
      },

      {
        prop: 'purchaserName',
        label: '采购员',
        type: 'input',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
        // width: 120,
      },
      {
        prop: 'supplierShortname',
        label: '供应商',
        type: 'input',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
        // width: 120,
      },
      {
        prop: 'checkTotalAmount',
        label: '工艺总价',
        type: 'input',
        // width: 120,
      },
      {
        prop: 'actualTotalAmount',
        label: '采购总价',
        type: 'input',
        // width: 120,
      },

      {
        prop: 'costSavingRatio',
        label: '成本节约比',
        type: 'input',
        // width: 120,
      },
      {
        prop: 'purchaseDate',
        label: '采购日期',
        type: 'input',
        // width: 120,
      },
      {
        prop: 'deliveryDate',
        label: '交货日期',
        type: 'input',
        // width: 120,
      },

      {
        prop: 'materialNum',
        label: '物料编码',
        width: '120px',
        align: 'center',
        type: 'clickable-text',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
      },
      {
        prop: 'versionNum',
        label: '版本号',
        // width: '90px',
        align: 'center',
        type: 'childRowText',
      },

      {
        prop: 'mtoNo',
        label: '专案号',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
      },
      {
        prop: 'qty',
        label: '数量',
        width: '50px',
        align: 'center',
        type: 'childRowText',
      },
      {
        prop: 'supplierPrice',
        label: '供应商单价',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
      },
      {
        prop: 'supplierAmount',
        label: '供应商总价',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
        customStyle: row => {
          // 当供应商金额和核价总价不相等时，添加红色标识
          const supplierAmount = parseFloat(row.supplierAmount);
          const checkAmount = parseFloat(row.checkAmount);
          if (!isNaN(supplierAmount) && !isNaN(checkAmount) && supplierAmount !== checkAmount) {
            return { color: '#F56C6C', fontWeight: 'bold' };
          }
          return {};
        },
      },
      {
        prop: 'historyLowestPrice',
        label: '历史最低价',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
      },
      {
        prop: 'checkAmount',
        label: '核价总价',
        // width: '120px',/
        align: 'center',
        type: 'childRowText',
        customStyle: row => {
          // 当供应商金额和核价总价不相等时，添加红色标识
          const supplierAmount = parseFloat(row.supplierAmount);
          const checkAmount = parseFloat(row.checkAmount);
          if (!isNaN(supplierAmount) && !isNaN(checkAmount) && supplierAmount !== checkAmount) {
            return { color: '#F56C6C', fontWeight: 'bold' };
          }
          return {};
        },
      },
      {
        prop: 'checkPrice',
        label: '核价单价',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
      },

      {
        prop: 'deliveryDate1',
        label: '交货日期',
        // width: '120px',
        align: 'center',
        type: 'childRowText',
      },
      {
        prop: 'note',
        label: '备注',
        width: '60px',
        align: 'center',
        type: 'childRowText',
      },

      //   {
      //     label: '操作',
      //     prop: 'action',
      //     type: 'actions',
      //     slotName: 'action',
      //     fixed: 'right',
      //     width: 80,
      //     children: [
      //       {
      //         type: 'button',
      //         label: '编辑',
      //         action: 'row-edit',
      //       },
      //     ],
      //   },
    ],
  };
};

export default options;
