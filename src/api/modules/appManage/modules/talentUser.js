import request from '@/axios';

export default {
  getList(params) {
    return request({
      url: '/blade-rbac/TalentUser/list',
      method: 'get',
      params,
    });
  },
  getDetail(params) {
    return request({
      url: '/blade-rbac/TalentUser/detail',
      method: 'get',
      params,
    });
  },
  submit(data) {
    return request({
      url: '/blade-rbac/TalentUser/submit',
      method: 'post',
      data,
    });
  },
  remove(params) {
    return request({
      url: '/blade-rbac/TalentUser/remove',
      method: 'delete',
      params,
    });
  },
  sendSms(data) {
    return request({
      url: '/blade-rbac/TalentUser/send-sms',
      method: 'post',
      data,
    });
  },
  phoneSubmit(data) {
    return request({
      url: '/blade-rbac/TalentUser/skip-url/submmit',
      method: 'post',
      data,
    });
  },
  getByPhone() {
    return request({
      url: '/blade-rbac/TalentUser/skip-url/getByPhone',
      method: 'get',
      params,
    });
  },
};
