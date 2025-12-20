import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data) {
    return request({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: {
        username: data.username,
        password: data.password,
        captchaId: data.captchaId,
        captchaCode: data.captchaCode,
        tenantId: data.tenantId,
      },
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken) {
    return request({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken: refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 注销登录接口 */
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
};

export default AuthAPI; 