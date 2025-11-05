import request from '@/axios';

export default {
  getShipList(params) {
    return request({
      url: '/blade-bip/skip-url/mps/assembly-progress/get-ship-list',
      method: 'get',
      params,
    });
  },
};
