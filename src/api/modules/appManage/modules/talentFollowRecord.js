import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentFollowRecord/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentFollowRecord/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentFollowRecord/submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentFollowRecord/remove',
      method: 'delete',
      params,
    });
  },
};
