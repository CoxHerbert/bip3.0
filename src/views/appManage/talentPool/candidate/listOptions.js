const searchConfig = (tabs, DC_SMS_STATUS) => {
  return {
    resetExcludeKeys: ['page', 'current', 'interviewStatus'],
    searchItemConfig: {
      paramType: {
        name: {
          label: '姓名',
          type: 'input',
          placeholder: '请输入姓名',
          paramKey: 'name',
        },
        smsStatus: {
          label: '短信状态',
          type: 'select',
          placeholder: '请选择短信状态',
          paramKey: 'smsStatus',
          options: (DC_SMS_STATUS || []).map(item => {
            return {
              ...item,
              value: item.dictKey,
            };
          }),
        },
      },
    },
    tabConfig: {
      prop: 'interviewStatus',
      items: (tabs || []).map(item => {
        return {
          ...item,
          value: item.dictKey || '',
        };
      }),
    },
  };
};

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

      // ===== 基本信息 =====
      {
        label: '姓名',
        prop: 'name',
        type: 'rowText',
        width: 100,
        search: true,
        searchProps: { is: 'input', placeholder: '姓名' },
        align: 'center',
      },
      {
        label: '投递岗位',
        prop: 'joinPostIds',
        type: 'rowText',
        minWidth: 160,
        props: {
          is: 'dc-view',
          objectName: 'post',
        },
        align: 'center',
      },
      {
        label: '跟进岗位',
        prop: 'postId',
        type: 'rowText',
        minWidth: 160,
        props: {
          is: 'dc-view',
          objectName: 'post',
        },
        align: 'center',
      },
      {
        label: '电话',
        prop: 'phone',
        type: 'rowText',
        width: 120,
        align: 'center',
      },

      // ===== 状态列（全部字典回显）=====
      {
        label: '应试状态',
        prop: 'interviewStatus',
        width: 100,
        // 使用全局字典 KEY（候选值都来自 {label,value}）
        dictKey: 'DC_EVALUATION_STATUS',
        align: 'center',

        // 如需搜索下拉可让外层根据 dictKey 生成；也可手动塞 options：
        // searchProps: { is: 'select', dictKey: 'DC_EVALUATION_STATUS' },
      },
      {
        label: '短信状态',
        prop: 'smsStatus',
        width: 100,
        dictKey: 'DC_SMS_STATUS',
        align: 'center',
      },
      {
        label: '解析方式',
        prop: 'parseType',
        width: 100,
        dictKey: 'DC_PARING_TYPE',
        align: 'center',
      },

      {
        label: '最后跟进',
        prop: 'lastFollowDate',
        width: 150,
        align: 'center',
      },
      {
        label: '跟进方式',
        prop: 'followType',
        width: 120,
        dictKey: 'DC_FOLLOW_TYPE',
        align: 'center',
      },
      {
        label: '跟进人',
        prop: 'followUserId',
        width: 100,
        align: 'center',
        props: {
          is: 'dc-view',
          objectName: 'user',
        },
      },

      // ===== 操作列 =====
      {
        prop: 'options',
        width: 160,
        label: '操作',
        fixed: 'right',
        type: 'actions',
        children: [
          { type: 'button', label: '快速跟进', action: 'followUp' },
          { type: 'button', label: '查看', action: 'view' },
        ],
      },
    ],
  };
};

export { options, searchConfig };
