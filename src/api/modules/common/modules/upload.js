import request from '@/axios';

export default {
  // 文件上传
  postFile(data, params) {
    return request({
      url: '/blade-resource/oss/endpoint/put-file-attach-path',
      method: 'post',
      data,
      params,
    });
  },
  // 多文件上传
  postFiles(data, params) {
    return request({
      url: '/blade-rbac/TalentResumeHandle/put-multi-file-attach-path',
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data,
      params,
    });
  },
};
