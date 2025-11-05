import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentProjectRecord/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentProjectRecord/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentProjectRecord/submit',
      method: 'post',
      data,
    });
  },
  batchSubmit(data) {
    return request({
      url: '/blade-rbac/TalentProjectRecord/batch-submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentProjectRecord/remove',
      method: 'delete',
      params,
    });
  },
};
