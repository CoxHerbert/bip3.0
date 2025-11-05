import request from '@/axios';

export default {
  /** 查询执行器列表 **/
  getXxlGroupList(params) {
    return request({
      url: '/blade-job/xxl-group/getList',
      method: 'get',
      params,
    });
  },
  /** 查询任务列表
   **/
  getXxlJobInfoList(params) {
    return request({
      url: '/blade-job/xxl-group/getJonInfoList',
      method: 'get',
      params,
    });
  },
  /** 删除任务 **/
  deleteXxlJobInfo(params) {
    return request({
      url: '/blade-job/xxl-group/remove',
      method: 'get',
      params,
    });
  },
  /** 添加任务 **/
  addXxlJobInfo(data) {
    return request({
      url: '/blade-job/xxl-group/addJonInfo',
      method: 'post',
      data,
    });
  },
  /** 更新任务 **/
  upXxlJobInfo(data) {
    return request({
      url: '/blade-job/xxl-group/upJonInfo',
      method: 'post',
      data,
    });
  },
  /** 停止任务 **/
  stopXxlJobInfo(params) {
    return request({
      url: '/blade-job/xxl-group/stop',
      method: 'get',
      params,
    });
  },
  /** 启动任务 **/
  startXxlJobInfo(params) {
    return request({
      url: '/blade-job/xxl-group/start',
      method: 'get',
      params,
    });
  },
  /** 手动触发任务 **/
  triggerXxlJobInfo(params) {
    return request({
      url: '/blade-job/xxl-group/trigger',
      method: 'get',
      params,
    });
  },
};
