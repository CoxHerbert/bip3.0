import request from '@/axios';

// 收料通知查询

export default {
  getSrmReceiveByQrCode(params) {
    return request({
      url: '/blade-bip/SnReceive/getSrmReceiveByQrCode',
      method: 'get',
      params,
    });
  },

  // 批量生成sn
  batchGenerate(data) {
    return request({
      url: '/blade-bip/SnRecord/batchGenerate',
      method: 'post',
      data,
    });
  },

  // mo批量生成sn
  moBatchGenerate(params) {
    return request({
      url: '/blade-bip/SnRecord/moBatchGenerate',
      method: 'post',
      params,
    });
  },
  // mo生成sn查询
  getSnRecordMoList(params) {
    return request({
      url: '/blade-bip/SnRecord/moList',
      method: 'post',
      params,
    });
  },

  // 仪器配置列表
  getMachineConfigList(params) {
    return request({
      url: '/blade-bip/MachineConfig/list',
      method: 'get',
      params,
    });
  },

  // 仪器配置添加和修改
  machineConfigSubmit(data) {
    return request({
      url: '/blade-bip/MachineConfig/submit',
      method: 'post',
      data,
    });
  },

  // 仪器配置删除
  machineConfigRemove(ids) {
    return request({
      url: '/blade-bip/MachineConfig/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  // 查询sn列表
  getSnRecordList(params) {
    return request({
      url: '/blade-bip/SnRecord/list',
      method: 'get',
      params,
    });
  },

  // 获取质检报告
  getInspectionReport(params) {
    return request({
      url: '/blade-bip/SnQuality/getQuality',
      method: 'get',
      params,
    });
  },

  // 获取报告列表
  getSnQualityList(params) {
    return request({
      url: '/blade-bip/SnQuality/list',
      method: 'get',
      params,
    });
  },

  // 绑定报告
  snRecordSubmit(data) {
    return request({
      url: '/blade-bip/SnRecord/reportBindings',
      method: 'post',
      data,
    });
  },

  // 获取测量报告
  getMeasurementReport(params) {
    return request({
      url: '/blade-bip/SnQuality/getMeasurementReport',
      method: 'get',
      params,
    });
  },

  // 列表
  getSnCheckMaterialList(params) {
    return request({
      url: '/blade-bip/SnCheckMaterial/list',
      method: 'get',
      params,
    });
  },

  // sip创建列表
  sipOrderList(params) {
    return request({
      url: '/blade-bip/SipOrder/list',
      method: 'get',
      params,
    });
  },

  // sip明细查询
  sipDetail(params) {
    return request({
      url: '/blade-bip/SipOrder/detail',
      method: 'get',
      params,
    });
  },

  // sip删除
  sipOrderRemove(ids) {
    console.log(ids);
    return request({
      url: '/blade-bip/SipOrder/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  // 配置项删除
  sipEntryRemove(ids) {
    return request({
      url: '/blade-bip/SipEntry/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  // sip创建添加和编辑
  sipOrderSubmit(data) {
    return request({
      url: '/blade-bip/SipOrder/submit',
      method: 'post',
      data,
    });
  },

  // 头部详情
  sipOrderDetail(params) {
    return request({
      url: '/blade-bip/SipOrder/order-detail',
      method: 'get',
      params,
    });
  },

  // 检查项保存和修改
  entrySubmit(data) {
    return request({
      url: '/blade-bip/SipEntry/entrySubmit',
      method: 'post',
      data,
    });
  },
  // 检查项
  sipChecklist(params) {
    return request({
      url: '/blade-bip/SipChecklist/list',
      method: 'get',
      params,
    });
  },
  // 升版
  sipOrderUpgrade(params) {
    return request({
      url: '/blade-bip/SipEntry/upgrade',
      method: 'get',
      params,
    });
  },

  // 获取物料
  getMaterialList(params) {
    return request({
      url: '/blade-pda/common/material-search',
      method: 'get',
      params,
    });
  },

  // 批量操作
  batchFinish(params, data) {
    return request({
      url: '/blade-bip/SnCheckMaterial/batch-finish',
      method: 'post',
      params,
      data,
    });
  },
  listByMtoNo(params) {
    return request({
      url: '/blade-bip/SipOrder/mto-material-query',
      method: 'get',
      params,
    });
  },

  // sip导入
  importSip(data) {
    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    return request({
      url: '/blade-bip/Sip/importSip',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // sip提交
  submitSip(data) {
    return request({
      url: '/blade-bip/Sip/submit',
      method: 'post',
      data,
    });
  },

  // sip列表
  sipList(params) {
    return request({
      url: '/blade-bip/Sip/list',
      method: 'get',
      params,
    });
  },

  // sip删除
  sipRemove(ids) {
    return request({
      url: '/blade-bip/Sip/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  // sip类型列表
  sipTypeList(params) {
    return request({
      url: '/blade-bip/SipType/list',
      method: 'get',
      params,
    });
  },
  // sip类型提交
  sipTypeSubmit(data) {
    return request({
      url: '/blade-bip/SipType/submit',
      method: 'post',
      data,
    });
  },

  // sip类型删除
  sipTypeRemove(ids) {
    return request({
      url: '/blade-bip/SipType/remove',
      method: 'delete',
      params: {
        ids,
      },
    });
  },

  // sip记录详情列表
  sipRecordDetailsList(params) {
    return request({
      url: '/blade-bip/SipRecordDetails/list',
      method: 'get',
      params,
    });
  },
  // sip类型查询模型名称
  queryModelName(params) {
    return request({
      url: '/blade-bip/SipType/queryModelName',
      method: 'get',
      params,
    });
  },

  // 绑定sip和检查项
  bindSipAndCheckItem(params) {
    return request({
      url: '/blade-bip/Sip/BindSipAndCheckItem',
      method: 'get',
      params,
    });
  },

  // 查询sip通过类型
  querySipByType(params) {
    return request({
      url: '/blade-bip/Sip/querySipByType',
      method: 'get',
      params,
    });
  },
};
