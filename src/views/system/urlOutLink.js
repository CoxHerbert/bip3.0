/** URL外链管理页面 */
const options = () => {
  return {
    columns: [
      {
        label: '序号',
        type: 'index',
        width: 60,
        align: 'center',
      },
      //   {
      //     prop: 'linkName',
      //     label: '链接名称',
      //     type: 'rowText',
      //     search: true,
      //     align: 'center',
      //     minWidth: 120,
      //     searchProps: {
      //       is: 'input',
      //       clearable: true,
      //       placeholder: '请输入链接名称',
      //     },
      //   },
      //   {
      //     prop: 'linkUrl',
      //     label: '链接地址',
      //     type: 'rowText',
      //     search: true,
      //     align: 'center',
      //     minWidth: 150,
      //     searchProps: {
      //       is: 'input',
      //       clearable: true,
      //       placeholder: '请输入链接地址',
      //     },
      //   },
      {
        prop: 'urlMatchRuleType',
        label: '匹配规则类型',
        type: 'dict',
        search: true,
        align: 'center',
        width: 120,
        dicData: [
          { label: '正则', value: 1 },
          { label: '静态', value: 2 },
        ],
        searchProps: {
          is: 'select',
          clearable: true,
          placeholder: '请选择匹配规则类型',
          options: [
            { label: '正则', value: 1 },
            { label: '静态', value: 2 },
          ],
        },
      },
      {
        prop: 'regularSourceType',
        label: '正则匹配源类型',
        type: 'dict',
        align: 'center',
        width: 140,
        dicData: [
          { label: 'PC', value: 1 },
          { label: 'H5', value: 2 },
        ],
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'regularTargetType',
        label: '正则匹配目标类型',
        type: 'dict',
        align: 'center',
        width: 150,
        dicData: [
          { label: 'PC', value: 1 },
          { label: 'H5', value: 2 },
        ],
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'regularRegexPattern',
        label: '正则匹配表达式',
        type: 'rowText',
        align: 'center',
        minWidth: 150,
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'regularReplacement',
        label: '正则匹配替换模板',
        type: 'rowText',
        align: 'center',
        minWidth: 150,
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'staticName',
        label: '静态匹配名称',
        type: 'rowText',
        align: 'center',
        minWidth: 120,
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'staticPcUrl',
        label: '静态匹配PC URL',
        type: 'rowText',
        align: 'center',
        minWidth: 150,
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'staticH5Url',
        label: '静态匹配H5 URL',
        type: 'rowText',
        align: 'center',
        minWidth: 150,
        hide: true, // 默认隐藏，根据匹配规则类型动态显示
      },
      {
        prop: 'priority',
        label: '优先级',
        type: 'rowText',
        align: 'center',
        width: 80,
      },

      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 180,
        children: [
          //   {
          //     type: 'button',
          //     label: '查看',
          //     action: 'view',
          //     permission(scope) {
          //       return {
          //         id: 'URL_OUT_LINK_VIEW',
          //         row: scope.row,
          //       };
          //     },
          //   },
          {
            type: 'button',
            label: '修改',
            action: 'edit',
            permission(scope) {
              return {
                id: 'URL_OUT_LINK_EDIT',
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
                id: 'URL_OUT_LINK_DELETE',
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
