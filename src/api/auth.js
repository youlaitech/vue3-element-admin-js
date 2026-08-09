import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data) {
    const payload = {
      username: data.username,
      password: data.password,
      captchaId: data.captchaId,
      captchaCode: data.captchaCode,
    };

    // tenantId is optional — include only when provided (multi-tenant feature)
    if (typeof data.tenantId !== "undefined") {
      payload.tenantId = data.tenantId;
    }

    return request({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: payload,
    });
  },

  /** 切换租户(平台用户) - 返回新的 token */
  switchTenant(tenantId) {
    return request({
      url: `${AUTH_BASE_URL}/switch-tenant`,
      method: "post",
      params: { tenantId },
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken) {
    return request({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 退出登录接口 */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },

  /** 获取验证码接口*/
  getCaptcha() {
    return request({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },

  // ============ 扫码登录 ============

  /** 申请扫码票据 */
  qrGenerate() {
    return request({
      url: `${AUTH_BASE_URL}/qr-code/generate`,
      method: "post",
    });
  },

  /** 轮询扫码状态 */
  qrStatus(ticket) {
    return request({
      url: `${AUTH_BASE_URL}/qr-code/status`,
      method: "get",
      params: { ticket },
    });
  },

  /** 扫码票据换取登录令牌 */
  qrLogin(ticket) {
    return request({
      url: `${AUTH_BASE_URL}/qr-code/login`,
      method: "post",
      data: { ticket },
    });
  },
};

export default AuthAPI;
