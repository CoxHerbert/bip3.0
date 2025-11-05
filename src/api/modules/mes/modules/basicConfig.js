import request from '@/axios';

export default {
  // 工序工艺列表
  technologyConfigList(params) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/list',
      method: 'get',
      params,
    });
  },

  // 工序工艺明细
  technologyConfigDetail(params) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/detail',
      method: 'get',
      params,
    });
  },
  // 工序工艺提交
  technologyConfigSubmit(data) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/submit',
      method: 'post',
      data,
    });
  },
  // 获取生成计划详情 entryId
  technologyConfigRemove(ids) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/remove',
      method: 'delete',
      params: { ids },
    });
  },
  // /api/blade-system/dict-biz/dictionary?code=
  // MPR字典获取
  mesMprDict(params) {
    return request({
      url: '/blade-system/dict-biz/detail',
      method: 'get',
      params,
    });
  },

  // 技术人员关联用户列表
  technologyUserRelationList(params) {
    return request({
      url: '/blade-bip/TechnologyUserRelation/user-page',
      method: 'get',
      params,
    });
  },

  // 技术人员关联用户绑定
  technologyUserRelationBind(data, ids) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/binding',
      method: 'post',
      params: { technologyId: data },
      data: ids,
    });
  },
  // 技术人员关联用户取消绑定
  technologyUserRelationCancelBind(data, ids) {
    return request({
      url: '/blade-bip/dc/mops/technology/config/cancel-binding',
      method: 'post',
      params: { technologyId: data },
      data: ids,
    });
  },
};
