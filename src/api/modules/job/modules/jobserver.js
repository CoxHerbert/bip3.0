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
};
