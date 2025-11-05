import request from '@/axios';

export default {
  // 获取最新版本号
  getAppLatestVersion() {
    return request({
      url: '/blade-bip/test/pda/version/the-latest-version',
      method: 'get',
    });
  },
  // 分解计划弹出框数据接口
  getPdaVersionList(params) {
    return request({
      url: '/blade-bip/test/pda/version/list',
      method: 'get',
      params,
    });
  },
  // 删除pda app版本表信息
  deletePdaVersion(ids) {
    return request({
      url: `/blade-bip/test/pda/version/remove?ids=${ids}`,
      method: 'DELETE',
    });
  },
  // 提交或保存
  postPdaVersion(data) {
    return request({
      url: '/blade-bip/test/pda/version/submit',
      method: 'POST',
      data,
    });
  },

  // url短连接规则列表
  getMessageList(params) {
    return request({
      url: '/blade-message/url-match-rule/list',
      method: 'get',
      params,
    });
  },

  // 提交或保存url短连接规则
  postMessage(data) {
    return request({
      url: '/blade-message/url-match-rule/submit',
      method: 'POST',
      data,
    });
  },
  // 删除url短连接规则
  deleteMessage(ids) {
    return request({
      url: `/blade-message/url-match-rule/remove?ids=${ids}`,
      method: 'DELETE',
    });
  },
};
