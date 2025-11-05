import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentPosition/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentPosition/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentPosition/submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentPosition/remove',
      method: 'delete',
      params,
    });
  },
};
