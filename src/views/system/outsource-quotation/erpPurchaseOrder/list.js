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
        width: '110px',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入单据编号',
        },
      },
      {
        prop: 'erpUp',
        label: '单据类型',
        type: 'input',
        fixed: 'left',
        width: '90px',
        customRender: row => {
          if (row.erpUp === 0) {
            return '采购订单';
          } else if (row.erpUp === 1) {
            return '变更申请';
          } else {
            return '-';
          }
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
        label: '执行人',
        type: 'input',
        width: 130,
        customRender: row => {
          // 合并显示执行人和待执行人
          const executor = row.taskName || '';
          const pendingExecutor = row.taskUserName || '';

          if (executor && pendingExecutor) {
            return `${executor} → ${pendingExecutor}`;
          } else if (executor) {
            return executor;
          } else if (pendingExecutor) {
            return pendingExecutor;
          } else {
            return '-';
          }
        },
        search: true,
        searchProps: {
          is: 'wf-select-dialog',
          placeholder: '请选择流程待执行人',
        },
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
        label: '节约比',
        type: 'input',
        // width: 120,
      },
      {
        prop: 'purchaseDate',
        label: '采购日期',
        type: 'input',
        width: 90,
      },
      {
        prop: 'deliveryDate',
        label: '交货日期',
        type: 'input',
        width: 90,
      },

      // {
      //   prop: 'fbillNo',
      //   label: '订单号',

      //   width: '150px',
      //   align: 'center',
      //   type: 'clickable-text',
      // },
      {
        type: 'expand',
        label: '子表详情',
        width: '80px',
        align: 'center',
        children: [
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
            prop: 'materialName',
            label: '物料名称',
            width: '120px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'versionNum',
            label: '版本',
            width: '45px',
            align: 'center',
            type: 'childRowText',
          },

          {
            prop: 'mtoNo',
            label: '专案号',
            width: '110px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'qty',
            label: '数量',
            width: '45px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'supplierPrice',
            label: '外发单价',
            // width: '120px',
            align: 'center',
            type: 'childRowText',
            customStyle: row => {
              // 根据供应商单价与核价单价的比较设置颜色
              const supplierPrice = parseFloat(row.supplierPrice);
              const checkPrice = parseFloat(row.checkPrice);
              if (!isNaN(supplierPrice) && !isNaN(checkPrice)) {
                if (supplierPrice > checkPrice) {
                  return { color: '#F56C6C', fontWeight: 'bold' }; // 红色
                } else if (supplierPrice < checkPrice) {
                  return { color: '#67C23A', fontWeight: 'bold' }; // 绿色
                }
              }
              return {};
            },
          },
          {
            prop: 'supplierAmount',
            label: '外发总价',
            // width: '120px',
            align: 'center',
            type: 'childRowText',
            customStyle: row => {
              // 根据供应商单价与核价单价的比较设置颜色
              const supplierPrice = parseFloat(row.supplierPrice);
              const checkPrice = parseFloat(row.checkPrice);
              if (!isNaN(supplierPrice) && !isNaN(checkPrice)) {
                if (supplierPrice > checkPrice) {
                  return { color: '#F56C6C', fontWeight: 'bold' }; // 红色
                } else if (supplierPrice < checkPrice) {
                  return { color: '#67C23A', fontWeight: 'bold' }; // 绿色
                }
              }
              return {};
            },
          },
          {
            prop: 'supplierPriceX',
            label: '变更前',
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
            // customStyle: row => {
            //   // 当供应商金额和核价总价不相等时，添加红色标识
            //   const supplierAmount = parseFloat(row.supplierAmount);
            //   const checkAmount = parseFloat(row.checkAmount);
            //   if (!isNaN(supplierAmount) && !isNaN(checkAmount) && supplierAmount !== checkAmount) {
            //     return { color: '#F56C6C', fontWeight: 'bold' };
            //   }
            //   return {};
            // },
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
            width: '90px',
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
        ],
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
