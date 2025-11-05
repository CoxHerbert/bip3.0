const options = () => {
  return {
    columns: [
      {
        type: 'selection',
        width: '40px',
        align: 'center',
        fixed: 'left',
      },
      {
        prop: 'billNo',
        label: '图号',
        type: 'clickable-text',
        fixed: 'left',
        width: '120px',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入单据编号',
        },
      },
      {
        prop: 'examineStatus',
        label: '审核状态',
        type: 'input',
        fixed: 'left',
        width: '90px',
        customRender: row => {
          if (row.examineStatus === 1) {
            return '进行中';
          } else if (row.examineStatus === 2) {
            return '已完成';
          } else {
            return '-';
          }
        },
      },
      {
        prop: 'pdmExamineStatus',
        label: '审批结果',
        type: 'input',
        fixed: 'left',
        width: '90px',
        customRender: row => {
          if (row.pdmExamineStatus == '0') {
            return '通过';
          } else if (row.pdmExamineStatus == '1') {
            return '拒绝';
          } else {
            return '-';
          }
        },
      },

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
        prop: 'materialCode',
        label: '物料编码',
        type: 'input',
        width: '140px',
        search: true,
        searchProps: {
          is: 'input',
          placeholder: '请输入材质名称',
        },
      },

      {
        type: 'expand',
        label: '子表详情',
        width: '80px',
        align: 'center',
        children: [
          {
            prop: 'mbNo',
            label: '物料编号',
            width: '120px',
            align: 'center',
            type: 'childRowText',
            search: true,
            searchProps: {
              is: 'input',
              placeholder: '请输入材质名称',
            },
          },
          {
            prop: 'mbDesc',
            label: '物料描述',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },

          {
            prop: 'materialProperties',
            label: '物料属性编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'materialPropertiesName',
            label: '物料属性名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbPicNo',
            label: '物料图号',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbUnit',
            label: '物料单位',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbUnitName',
            label: '物料单位名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbOldNo',
            label: '物料旧编号',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbType',
            label: '物料类型',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbTypeName',
            label: '物料类型名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'processingCategory',
            label: '加工编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'processingCategoryName',
            label: '加工名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'productCode',
            label: '关联产品编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbCaizhi',
            label: '物料材质',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'heatTreatment',
            label: '热处理要求',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'surfaceTreatment',
            label: '表面处理要求',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbYjfl01',
            label: '一级分类编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbYjfl01Name',
            label: '一级分类名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbErjfl02',
            label: '二级分类编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbErjfl02Name',
            label: '二级分类名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbSjfl03',
            label: '三级分类编码',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbSjfl03Name',
            label: '三级分类名称',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'year',
            label: '关联年份',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },

          {
            prop: 'dfmVersion',
            label: 'DFM版本号',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'm',
            label: '记录编号',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'sm',
            label: '特殊标识',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'versions',
            label: '版本号',
            width: '100px',
            align: 'center',
            type: 'childRowText',
          },

          {
            prop: 'fIssnManage',
            label: '刊号管理标识',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbSpec',
            label: '物料规格参数',
            width: '140px',
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
            prop: 'processRequirement',
            label: '加工要求',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbPinpai',
            label: '物料品牌',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'weight',
            label: '物料重量',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              return !row.weight ? '-' : row.weight + 'kg';
            },
          },
          {
            prop: 'lossRate',
            label: '物料损耗率单位',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              return !row.lossRate ? '-' : row.lossRate + '%';
            },
          },
          {
            prop: 'fIsPrecisionPart',
            label: '是否精密零件',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              if (row.fIsPrecisionPart === 'Y') {
                return '是';
              } else if (row.fIsPrecisionPart === 'N') {
                return '否';
              } else {
                return '-';
              }
            },
          },
          {
            prop: 'mbGjlbj',
            label: '关键部件标识',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbJct',
            label: '检测标准',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'revisedEdition',
            label: '修订版次',
            width: '140px',
            align: 'center',
            type: 'childRowText',
          },
          {
            prop: 'mbLength',
            label: '物料长度',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              return !row.mbLength ? '-' : row.mbLength + 'mm';
            },
          },
          {
            prop: 'mbWidth',
            label: '物料宽度',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              return !row.mbWidth ? '-' : row.mbWidth + 'mm';
            },
          },
          {
            prop: 'mbHeight',
            label: '物料高度',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              return !row.mbHeight ? '-' : row.mbHeight + 'mm';
            },
          },

          {
            prop: 'lockState',
            label: '锁定状态',
            width: '140px',
            align: 'center',
            type: 'childRowText',
            customRender: row => {
              if (row.lockState === '0') {
                return '未锁定';
              } else if (row.lockState === '1') {
                return '已锁定';
              } else {
                return '-';
              }
            },
          },
          {
            prop: 'mbDesc',
            label: '备注',
            width: '140px',
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
