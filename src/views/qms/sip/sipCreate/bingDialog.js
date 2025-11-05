/** 检验配置页面 */
import Const from '@/const';
const options = () => {
  return {
    columns: [
      {
        prop: 'category',
        label: '类别',
        type: 'dict',
        dictKey: 'DC_INSPECTION_CLASS',
        labelKey: 'dictValue',
        valueKey: 'dictKey',
        props: {
          disabled: true,
        },
        required: true,
      },

      {
        prop: 'mtoNo',
        label: '专案号',
        type: 'wf-select-dialog',
        // display: true, // 默认不显示，根据类型选择显示
        required: false,
        props: {
          objectName: 'CompleteMtoNo',
          disabled: true,
          masterKey: 'billNo',
          showKey: 'billNo',
          placeholder: '请选择专案',
          multiple: true,
        },
      },

      {
        prop: 'materialNumber',
        label: '物料',
        type: 'wf-select-dialog',
        // display: true, // 默认不显示，根据类型选择显示
        required: false,
        props: {
          objectName: 'SnCheckMaterial',
          placeholder: '请选择物料',
          multiple: true,
          disabled: true,
          masterKey: 'fnumber',
          showKey: 'fnumber',
          showValue: false, // 不回显选中的值
          query: {
            fuseorgid: 100006,
          },
        },
      },
      {
        label: '绑定sip分类',
        prop: 'typeIds',
        type: 'el-select',
        required: true,
        props: {
          placeholder: '请选择绑定sip分类',
          // multiple: true,
        },
      },
    ],
  };
};

export default options;
