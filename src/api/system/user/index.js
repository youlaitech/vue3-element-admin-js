import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  /**
   * 获取当前用户资料、角色与权限。
   */
  getInfo() {
    return request({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  },

  /**
   * 获取用户分页列表
   */
  getPage(queryParams) {
    return request({
      url: USER_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取用户表单详情
   */
  getFormData(userId) {
    return request({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  },

  /**
   * 添加用户
   */
  create(data) {
    return request({
      url: USER_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 修改用户
   */
  update(id, data) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 修改用户启用状态。
   */
  updateStatus(userId, status) {
    return request({
      url: `${USER_BASE_URL}/${userId}/status`,
      method: "patch",
      params: { status },
    });
  },

  /**
   * 修改用户密码
   */
  resetPassword(id, password) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      data: { password },
    });
  },

  /**
   * 批量删除用户，ID 以英文逗号分隔。
   */
  deleteByIds(ids) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 下载用户导入模板
   */
  downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
    });
  },

  /**
   * 导出用户
   */
  export(queryParams) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },

  /**
   * 导入用户
   */
  import(file) {
    const formData = new FormData();
    formData.append("file", file);
    return request({
      url: `${USER_BASE_URL}/import`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 获取个人中心用户信息
   */
  getProfile() {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "get",
    });
  },

  /**
   * 修改个人中心用户信息
   */
  updateProfile(data) {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "put",
      data,
    });
  },

  /**
   * 修改个人中心用户密码
   */
  changePassword(data) {
    return request({
      url: `${USER_BASE_URL}/password`,
      method: "put",
      data,
    });
  },

  /**
   * 发送短信验证码（绑定或更换手机号）
   */
  sendMobileCode(mobile) {
    return request({
      url: `${USER_BASE_URL}/mobile/code`,
      method: "post",
      params: { mobile },
    });
  },

  /**
   * 绑定或更换手机号
   */
  bindOrChangeMobile(data) {
    return request({
      url: `${USER_BASE_URL}/mobile`,
      method: "put",
      data,
    });
  },

  /**
   * 解绑手机号
   */
  unbindMobile(data) {
    return request({
      url: `${USER_BASE_URL}/mobile`,
      method: "delete",
      data,
    });
  },

  /**
   * 发送邮箱验证码（绑定或更换邮箱）
   */
  sendEmailCode(email) {
    return request({
      url: `${USER_BASE_URL}/email/code`,
      method: "post",
      params: { email },
    });
  },

  /**
   * 绑定或更换邮箱
   */
  bindOrChangeEmail(data) {
    return request({
      url: `${USER_BASE_URL}/email`,
      method: "put",
      data,
    });
  },

  /**
   * 解绑邮箱
   */
  unbindEmail(data) {
    return request({
      url: `${USER_BASE_URL}/email`,
      method: "delete",
      data,
    });
  },

  /**
   * 获取用户下拉列表
   */
  getOptions() {
    return request({
      url: `${USER_BASE_URL}/options`,
      method: "get",
    });
  },
};

export default UserAPI;
