/** SIP类别管理编辑对话框 */
const options = () => {
  return {
    columns: [
      {
        prop: 'moduleName',
        label: '模组名称',
        type: 'el-select',
        required: true,
        props: {
          placeholder: '请输入模组名称',
        },
      },
      {
        prop: 'checkType',
        label: '检验类型',
        type: 'input',
        required: true,
        props: {
          placeholder: '请输入检验类型',
        },
      },
      {
        prop: 'fileUrl',
        label: '附件(图片)',
        type: 'upload',
        required: false,
        props: {
          limit: 1,
        },
      },
      {
        prop: 'inspectionItemName',
        label: '检查项名称',
        type: 'input',
        required: true,
        props: {
          placeholder: '请输入检查项名称',
        },
      },
      {
        prop: 'method',
        label: '是否测量',
        type: 'radio',
        required: true,
        value: 0,
        props: {
          options: [
            { label: '不测', value: 0 },
            { label: '测', value: 1 },
          ],
        },
      },
    ],
  };
};

export default options;
