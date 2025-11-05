import request from '@/axios';

export default {
  // 移动标签列表
  mesMoveLabelList(params) {
    return request({
      url: '/blade-bip/dc/mes/transfer/transferList',
      method: 'get',
      params,
    });
  },

  // 名称牌列表
  nameplateList(params) {
    return request({
      url: '/blade-bip/Nameplate/list',
      method: 'get',
      params,
    });
  },
  // 名称牌客户列表
  nameplateCustomerList(params) {
    return request({
      url: '/blade-bip/Nameplate/queryNameplateCustomerList',
      method: 'get',
      params,
    });
  },
  // 名称牌客户详情
  nameplateCustomerDetail(params) {
    return request({
      url: '/blade-bip/Nameplate/queryNameplateCustomerDetail',
      method: 'get',
      params,
    });
  },
  // 名称牌提交
  nameplateSubmit(data) {
    return request({
      url: '/blade-bip/Nameplate/submit',
      method: 'post',
      data,
    });
  },
  // 名称牌删除
  nameplateRemove(ids) {
    return request({
      url: '/blade-bip/Nameplate/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },
  // 名称牌客户添加
  nameplateCustomerAdd(data) {
    return request({
      url: '/blade-bip/Nameplate/addNameplateCustomer',
      method: 'post',
      data,
    });
  },
  // 名称牌详情
  nameplateDetail(params) {
    return request({
      url: '/blade-bip/Nameplate/detail',
      method: 'get',
      params,
    });
  },

  // 名称牌客户删除
  nameplateCustomerRemove(data) {
    return request({
      url: '/blade-bip/Nameplate/deleteNameplateCustomer',
      method: 'post',
      data,
    });
  },

  //批次相关
  // 批次列表
  batchList(params) {
    return request({
      url: '/blade-bip/NameplateBatch/list',
      method: 'get',
      params,
    });
  },

  // 名称牌批次详情
  NameplateBatchDetail(params) {
    return request({
      url: '/blade-bip/NameplateBatch/NameplateBatchDeatils',
      method: 'get',
      params,
    });
  },
  NameplateBatchByMoList(data) {
    return request({
      url: '/blade-bip/NameplateBatch/NameplateBatchByMoList',
      method: 'POST',
      data,
    });
  },
  // 名称牌批次启动
  startNameplateBatch(data) {
    return request({
      url: '/blade-bip/NameplateBatch/startNameplateBatch',
      method: 'POST',
      data,
    });
  },
  // 名称牌批次删除
  deleteNameplateBatch(data) {
    return request({
      url: '/blade-bip/NameplateBatch/deleteNameplateBatch',
      method: 'POST',
      data,
    });
  },

  // 名称牌批次列表
  queryNameplateBatchList(params) {
    return request({
      url: '/blade-bip/NameplateBatch/queryNameplateBatchList',
      method: 'get',
      params,
    });
  },

  // 名称牌批次 restructuringData
  nameplateBatchRestructuringData(data) {
    return request({
      url: '/blade-bip/NameplateBatch/nameplateBatchRestructuringData',
      method: 'post',
      data,
    });
  },
  // 名称牌批次启动 restructuringData
  startBatchRestructuringData(data) {
    return request({
      url: '/blade-bip/NameplateBatch/startBatchRestructuringData',
      method: 'post',
      data,
    });
  },

  // 名称牌批次详情
  queryAllById(params) {
    return request({
      url: '/blade-bip/NameplateBatch/queryAllById',
      method: 'get',
      params,
    });
  },
};
