/**
 * 按协议前缀识别外部链接。
 */
export function isExternal(path) {
  return /^(https?:|http?:|mailto:|tel:)/.test(path);
}

/**
 * 判断是否能解析为绝对 URL。
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
