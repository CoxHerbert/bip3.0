import request from '@/axios';

export default {
  getDicts(code) {
    return request({
      url: `/api/blade-system/dict-biz/dictionary?code=${code}`,
      method: 'get',
    });
  },
  getDicts2(params) {
    return request({
      url: `/api/blade-system/dict-biz/dictionary`,
      method: 'get',
      params,
    });
  },
  getMultipleDict(codes) {
    return request({
      url: `/blade-system/dict-biz/dictionary-map?code=${codes}`,
      method: 'get',
    });
  },
};
