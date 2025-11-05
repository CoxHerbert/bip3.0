import request from '@/axios';

export default {
  // 带我处理
  getForwardList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/list',
      method: 'get',
      params,
    });
  },
  postBatchErpTransfer(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/batch-erp-transfer',
      method: 'post',
      data,
    });
  },
  // 标记完成
  postMarkComplete(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/mark-complete',
      method: 'post',
      params,
    });
  },
  // 标记完成
  postOrderTransfer(data) {
    return request({
      url: '/blade-bip/dc/mes/transfer/order-transfer',
      method: 'post',
      data,
    });
  },
  // 负责人选择
  getChargePersonList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/get-charge-person-list',
      method: 'get',
      params,
    });
  },
  // 工序转发列表
  getForwardPlanList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/plan-list',
      method: 'get',
      params,
    });
  },
  // 工序详情
  getProcessHoverInfo(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/get-process-hover-info',
      method: 'get',
      params,
    });
  },
  // 工序转发详情
  getForwardDetail(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/detail',
      method: 'get',
      params,
    });
  },
  // 提交
  submitForward(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/submit',
      method: 'post',
      data,
    });
  },
  // 删除
  deleteForward(data) {
    return request({
      url: '/blade-bip/dc/mes/forward/remove',
      method: 'delete',
      data,
    });
  },
  // 库存物料列表
  getStockMaterialList(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/stock-material-list',
      method: 'get',
      params,
    });
  },
  // 保存明细
  saveItem(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/save-item',
      method: 'post',
      params,
    });
  },
  // 获取参考工序
  getReferenceProcess(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/get-reference-process',
      method: 'get',
      params,
    });
  },
  // 工艺
  getTechnologyList() {
    return request({
      url: '/blade-bip/dc/mes/forward/get-technology-list',
      method: 'get',
    });
  },
  // 添加工艺
  getTechnologyByMainId(params) {
    return request({
      url: '/blade-bip/dc/mes/forward/get-technology-by-main-id',
      method: 'get',
      params,
    });
  },
};
