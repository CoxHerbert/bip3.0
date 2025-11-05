import request from '@/axios';

export default {
  // 转单明细查询
  getOrderTransDetail(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/detail',
      method: 'get',
      params,
    });
  },
  // 转单记录
  getOrderTransList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/list',
      method: 'get',
      params,
    });
  },
  // 转单
  postOrderTrans(data) {
    return request({
      url: '/blade-bip/dc/mes/transfer/order-transfer',
      method: 'post',
      data,
    });
  },
  // 获取供应商列表
  getSupplierList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/supplier-list',
      method: 'get',
      params,
    });
  },
  getChooseProcess(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/get-choose-process-list',
      method: 'post',
      data,
    });
  },
  getTransferById(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/get-transfer-by-id',
      method: 'get',
      params,
    });
  },
  postErpTransfer(data) {
    return request({
      url: '/blade-bip/dc/mes/transfer/erp-transfer',
      method: 'post',
      data,
    });
  },
};
