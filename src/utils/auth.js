// 访问 token 缓存的 key
const ACCESS_TOKEN_KEY = "access_token";
// 刷新 token 缓存的 key
const REFRESH_TOKEN_KEY = "refresh_token";
// 记住我缓存的 key
const REMEMBER_ME_KEY = "remember_me";

function getRememberMe() {
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

function getAccessToken() {
  const rememberMe = getRememberMe();
  return rememberMe
    ? localStorage.getItem(ACCESS_TOKEN_KEY) || ""
    : sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

function getRefreshToken() {
  const rememberMe = getRememberMe();
  return rememberMe
    ? localStorage.getItem(REFRESH_TOKEN_KEY) || ""
    : sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

function setTokens(accessToken, refreshToken, rememberMe) {
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
  if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

export { getAccessToken, getRefreshToken, getRememberMe, setTokens, clearAuth };