// listOptions.js
const searchConfigFun = (tabs = []) => {
  tabs = [
    {
      label: '全部',
      value: '',
    },
    ...tabs.map(dic => ({ ...dic, value: dic.dictKey })),
  ];
  return {
    resetExcludeKeys: ['page', 'current', 'parseStatus'],
    searchItemConfig: {
      paramType: {
        name: { label: '姓名', type: 'input', placeholder: '请输入姓名', paramKey: 'name' },
        post: { label: '岗位', type: 'input', placeholder: '请输入岗位', paramKey: 'post' },
      },
    },
    tabConfig: {
      prop: 'parseStatus',
      // 避免修改原数组项，返回新对象更安全
      items: tabs,
    },
  };
};

// ✅ 改这行
export { searchConfigFun };
