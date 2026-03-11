import type { PageParam, PageResult } from '@vben/request';

import { requestClient } from '#/api/request';

export namespace CrmAttachmentApi {
  /** 附件信息 */
  export interface Attachment {
    id?: number; // 主键
    bizType?: number; // CRM 类型（关联 CrmBizTypeEnum）
    bizId?: number; // CRM 类型数据编号
    urlPath: string; // 文件URL路径（必需）
    fileName?: string; // 文件名称
    fileSize?: number; // 文件大小（字节）
    fileType?: string; // 文件类型
    createTime?: Date; // 创建时间
  }

  /** 附件创建请求 */
  export interface CreateReqVO {
    bizType: number; // CRM 类型（必需）
    bizId: number; // CRM 类型数据编号（必需）
    urlPath: string; // 文件URL路径（必需）
    fileName?: string; // 文件名称
    fileSize?: number; // 文件大小（字节）
    fileType?: string; // 文件类型
  }

  /** 附件查询请求 */
  export interface PageReqVO extends PageParam {
    bizType: number; // CRM 类型
    bizId: number; // CRM 类型数据编号
  }
}

/** 查询附件分页列表 */
export function getAttachmentPage(params: CrmAttachmentApi.PageReqVO) {
  return requestClient.get<PageResult<CrmAttachmentApi.Attachment>>(
    '/crm/attachment/page',
    { params },
  );
}

/** 创建附件 */
export function createAttachment(data: CrmAttachmentApi.CreateReqVO) {
  return requestClient.post('/crm/attachment/create', data);
}

/** 删除附件 */
export function deleteAttachment(id: number) {
  return requestClient.delete(`/crm/attachment/delete?id=${id}`);
}

/** 批量删除附件 */
export function deleteAttachmentList(ids: number[]) {
  return requestClient.delete(
    `/crm/attachment/delete-list?ids=${ids.join(',')}`,
  );
}
