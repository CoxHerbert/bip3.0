import request from '@/axios';

export default {
  // 查询并更新访问记录
  updateByCode(params) {
    return request({
      url: '/blade-message/url-match/get-and-update-by-code',
      method: 'GET',
      params,
    });
  },
  submmitTicket(data) {
    return request({
      url: '/blade-message/url-match-ticket/skip-url/submmit-ticket',
      method: 'post',
      data,
    });
  },
};
