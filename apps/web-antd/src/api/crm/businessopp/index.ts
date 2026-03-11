import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace CrmBusinessOppApi {
  /** 权限保存请求VO */
  export interface PermissionSaveReqVO {
    userId: number; // 用户编号
    bizType: number; // 业务类型
    bizId?: number; // 业务ID
    level: number; // 权限级别
    toBizTypes?: number; // 同时添加至
    roleId?: number; // 角色ID
  }
  /** 附件保存请求VO */
  export interface AttachmentSaveReqVO {
    urlPath: string; // 文件URL路径（必需）
    fileName?: string; // 文件名称
    fileSize?: number; // 文件大小（字节）
    fileType?: string; // 文件类型
    bizType?: number; // CRM 类型（关联 CrmBizTypeEnum）
  }
  export interface AttachmentSaveReqVO {
    updateTime?: string; // 更新时间
    nextTime?: string; // 下次跟进时间
    createTime?: string; // 创建时间
  }

  /** CRM商机信息 */
  export interface BusinessOpp {
    id: number; // 主键ID
    customerId?: number; // 关联客户ID
    customerRlistId?: number; // 关联客户需求ID
    oppsName?: string; // 商机名称
    oppsCode?: string; // 商机编码
    fromId?: number; // 来源ID
    fromDesc?: string; // 来源详情
    expAmount?: number; // 预估金额（元）
    deptId?: string; // 所属部门ID
    sectorId?: number; // 商机分类-字典（CRM行业类别）
    oppsLevelId?: number; // 商机级别-字典（CRM商机级别）
    bdUserId?: number; // BD负责人ID
    tpmUserId?: number; // TPM负责人ID
    oppsStatusId?: number; // 商机状态-字典（CRM商机状态）
    oppsOrgId?: string; // 所属组织编码
    oppsDeptId?: string;
    oppsBackground?: string; // 商机背景
    progressDesc?: string; // 进度描述
    oppsSharingMethod?: number; // 共享方式-字典
    oppsSharingUserIds?: string; // 共享人ID集合（逗号分隔）
    oppsCompetitor?: string; // 竞争对手
    AttachmentSaveReqVO?: AttachmentSaveReqVO; // 附件保存请求VO
    oppsAttachmentIds?: string; // 关联附件ID集合（逗号分隔）
    attachmentSaveReqVOS?: AttachmentSaveReqVO[]; // 附件保存请求VO列表
    oppsExpectedTransactionDate?: string; // 预计成交日期
    foundryIds?: string; // 关联代工厂ID集合（逗号分隔）
    failureReason?: string; // 输单原因
    abortReason?: string; // 中止原因
    endRemark?: string; // 结束时的备注
    customerContactIds?: string; // 关联客户联系人ID集合（逗号分隔）
    tpmUserName?: string; // TPM负责人姓名
    bdUserName?: string; // BD负责人姓名
    oppsLevelName?: string; // 商机级别名称
    oppsCategoryName?: string; // 商机分类名称
    createTime?: string; // 创建时间
    customerName?: string; // 客户名称
    sectorName?: string; // 商机分类名称
    oppsOrgName?: string; // 所属组织名称
    deptName?: string; // 所属部门名称
    creatorName?: string; // 登记人姓名
    updaterName?: string; // 修改人姓名
    updateTime?: string; // 修改时间
    createDeptName?: string; // 创建部门名称
    updateDeptName?: string; // 修改部门名称
    permissionSaveReqVOS?: PermissionSaveReqVO[]; // 权限保存请求VO列表
  }
}

/** 查询CRM商机分页 */
export function getBusinessOppPage(params: PageParam) {
  return requestClient.get<PageResult<CrmBusinessOppApi.BusinessOpp>>(
    '/crm/opps/page',
    {
      params,
    },
  );
}

/** 查询CRM商机详情 */
export function getBusinessDetailOpp(id: number) {
  return requestClient.get<CrmBusinessOppApi.BusinessOpp>(
    `/crm/opps/get?id=${id}`,
  );
}

/** 新增CRM商机 */
export function createBusinessOpp(data: CrmBusinessOppApi.BusinessOpp) {
  return requestClient.post('/crm/opps/create', data);
}

/** 修改CRM商机 */
export function updateBusinessOpp(data: CrmBusinessOppApi.BusinessOpp) {
  return requestClient.put('/crm/opps/update', data);
}

/** 获得商机列表（精简） */
export function getSimpleBusinessOppList() {
  return requestClient.get<CrmBusinessOppApi.BusinessOpp[]>(
    '/crm/opps/simple-all-list',
  );
}

/** 删除CRM商机 */
export function deleteBusinessOpp(id: number) {
  return requestClient.delete(`/crm/opps/delete?id=${id}`);
}

/** 批量删除CRM商机 */
export function deleteBusinessOppList(ids: number[]) {
  return requestClient.delete(`/crm/opps/delete-list?ids=${ids.join(',')}`);
}

/** 导出CRM商机 */
export function exportBusinessOpp(params: any) {
  return requestClient.download('/crm/opps/export-excel', { params });
}
