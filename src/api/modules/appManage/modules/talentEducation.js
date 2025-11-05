import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentEducation/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentEducation/detail',
      method: 'get',
      params,
    });
  },
  batchSubmit(data) {
    return request({
      url: '/blade-rbac/TalentEducation/batch-submit',
      method: 'post',
      data,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentEducation/submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentEducation/remove',
      method: 'delete',
      params,
    });
  },
};
