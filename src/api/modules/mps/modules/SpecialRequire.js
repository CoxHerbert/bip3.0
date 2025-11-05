import request from '@/axios';

export default {
  // 分页查询列表
  submit(data) {
    return request({
      url: '/blade-bip/SpecialRequire/submit',
      method: 'post',
      data,
    });
  },
  // 查询详情
  detail(params) {
    return request({
      url: '/blade-bip/SpecialRequire/get-detail-by-moId',
      method: 'get',
      params,
    });
  },
  // 保存
  submitsave(data) {
    return request({
      url: '/blade-bip/SpecialRequire/save-by-moId',
      method: 'post',
      data,
    });
  },
};
