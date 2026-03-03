import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/h5/bpm',
    redirect: '/h5/bpm/process-instance/create',
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/h5/bpm/process-instance/create',
    name: 'BpmH5ProcessInstanceCreate',
    component: () => import('#/views/bpm/processInstance/h5/create/index.vue'),
    meta: {
      title: '创建流程',
      hideInMenu: true,
      hideInTab: true,
    },
  },
  {
    path: '/h5/bpm/process-instance/detail',
    name: 'BpmH5ProcessInstanceDetail',
    component: () => import('#/views/bpm/processInstance/h5/detail/index.vue'),
    meta: {
      title: '流程详情',
      hideInMenu: true,
      hideInTab: true,
      keepAlive: false,
    },
    props: (route) => ({
      id: route.query.id,
      taskId: route.query.taskId,
      activityId: route.query.activityId,
    }),
  },
];

export default routes;
