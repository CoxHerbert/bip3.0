import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentWorkRecord/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentWorkRecord/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentWorkRecord/submit',
      method: 'post',
      data,
    });
  },
  batchSubmit(data) {
    return request({
      url: '/blade-rbac/TalentWorkRecord/batch-submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentWorkRecord/remove',
      method: 'delete',
      params,
    });
  },
};
