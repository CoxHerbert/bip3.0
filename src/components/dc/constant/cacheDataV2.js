export default {
  post: {
    url: '/blade-rbac/TalentPosition/select-data',
    defaultLabel: 'postName',
    defaultLabelName: '岗位名称',
    title: '岗位选择',
    placeholder: '请输入岗位名称选择',
    submitTitle: '岗位',
    dialogGet: '/',
    column: [
      {
        label: '名称',
        prop: 'name',
      },
      {
        label: '版本',
        prop: 'version',
      },
      {
        label: 'key',
        prop: 'modelKey',
      },
      {
        label: 'serviceCallback',
        prop: 'serviceCallback',
      },
    ],
  },
};
