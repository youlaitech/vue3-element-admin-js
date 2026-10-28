import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const IdentityAPI = {
  /**
   * 读取当前认证中心及用户身份；未关联时 subject 为空。
   */
  get(userId) {
    return request({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "get",
    });
  },

  /**
   * 保存或替换用户身份；重复保存同一个 subject 不产生额外变更。
   */
  set(userId, data) {
    return request({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "put",
      data,
    });
  },

  /**
   * 解除当前认证源的身份关联，重复解除可成功。
   */
  remove(userId) {
    return request({
      url: `${USER_BASE_URL}/${userId}/oidc-identity`,
      method: "delete",
    });
  },
};

export default IdentityAPI;
