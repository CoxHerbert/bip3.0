import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/remove',
      method: 'delete',
      params,
    });
  },
  aiResumeProcessing(params) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/aiResumeProcessing',
      method: 'get',
      params,
    });
  },
};
